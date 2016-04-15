'use strict';

var request             = require('request');
var fs                  = require('fs');
var crypto              = require('crypto');
var OS                  = require('os');
var path                = require('path');
var Sound               = require('./node-mpg123.js');
var childProcess        = require('child_process');
var GarbageCollector    = require('./garbage-collector.js');

class Player{

    constructor(helper, config){

        this.helper = helper;
        this.queue = [];
        this.config = config;
        this.execPath = 'mpg123';

        if(config.binaryPath){
            this.execPath = path.normalize(config.binaryPath);
        }

        // This boolean avoid to play song when queue is empty but a song is still playing.
        // It's then useful only in this particular situation
        this.playing = false;

        // The garbage clean the tmp folder after some times
        this.garbage = new GarbageCollector();

        this.tmpDirPattern = this.helper.getSystem().config.system.tmpDir + '/:voice-:text.mp3';

        this.helper.getLogger().debug('Using [%s] as tmp dir and pattern', this.tmpDirPattern);

        // Load voice
        if(!config.voice || !this.config.voices[config.voice]){
            this.helper.getLogger().debug('No voice selected, use Melodine by default');
            this.voice = this.config.voices['Melodine'];
        }
        else{
            this.voice = this.config.voices[config.voice];
        }
    }

    /**
     *
     * @param text
     * @param cb
     */
    play(text, cb){

        var self = this;
        this._extractSound(self.voice, text, function(err, fileName){
            if(err){
                return cb(err);
            }

            // add element to the start of queue. It will be the next played
            self.queue.splice(0, 0, fileName);
            console.log('There is now ' + self.queue.length + ' sounds in queue');
            if(self.queue.length === 1 && !self.playing){
                self._play(fileName, true, cb);
            }
        });
    }

    /**
     * Play the given song and try to play the next in queue.
     * @param fileName
     * @param isFirst
     * @param cb
     * @private
     */
    _play(fileName, isFirst, cb){
        var self = this;

        self.playing = true;

        // fire and forget:
        var music = new Sound(fileName, this.execPath);
        music.play();

        // you can also listen for various callbacks:
        music.on('complete', function () {
            self.helper.getLogger().log('Done with playback!');

            self.playing = false;

            // Just clear first item in order to not pop this one and play it again
            if(isFirst === true){
                self.queue.pop();
            }

            console.log('Sounds still in queue ' + self.queue.length);

            // Try to read next in queue
            var stillInQueue = self.queue.pop();
            if(typeof stillInQueue !== 'undefined'){
                self._play(stillInQueue);
            }
        });

        music.on('stop', function(){

        });

        music.on('pause', function(){

        });

        music.on('resume', function(){

        });
    }

    /**
     *
     * @param voice
     * @param text
     * @param cb
     */
    _extractSound(voice, text, cb){

        var textMd5 = crypto.createHash('md5').update(text).digest('hex');
        var url = this.config.voxygenBasePath.replace(':voice', voice).replace(':text', encodeURI(text));
        var fileName = this.helper.getSystem().config.system.tmpDir + '/:voice-:text.mp3'.replace(':voice', voice).replace(':text', textMd5);

        if(Player.soundExist(fileName)){
            return cb(null, fileName);
        }

        console.log('request voice for %s', url);
        var tmp = request
            .get(url)
            .on('error', function(err) {
                console.log(err);
                if(cb){
                    return cb(err);
                }
            })
            .on('response', function(response){
                if(response.statusCode === 400){
                    console.error('Invalid request made to voxygen');
                    this.emit( "end" );
                    fs.unlink(fileName);
                    return cb(new Error('Invalid request made to voxygen'));
                }
            })
            .on('end', function(response){
                console.log(response);
                if(cb){
                    return cb(null, fileName);
                }
            })
            .pipe(fs.createWriteStream(fileName));
    }

    /**
     *
     * @param helper
     * @param config
     * @param cb
     */
    static create(helper, config, cb){
        var instance = new Player(helper, config);
        Player.checkLibrary(instance.execPath, function(err){
            return cb(err, instance);
        });
    }

    static soundExist(fileName){

        try {
            var stats = fs.lstatSync(fileName);
        }
        catch (e) {
            if(e.code === 'ENOENT'){
                return false;
            }
            throw e;
        }

        // Is it a directory?
        if (stats.isFile()) {
            return true;
        }

        return false;
    }

    static checkLibrary(execPath, cb){
        const spawn = childProcess.spawn;
        const ls = spawn(path.normalize(execPath), ['-?']);

        ls.on('error', function(code){
            // needed otherwise it throw exception
        });

        ls.on('close', function(code){
            if(code !== 0){
                var error = new Error('Please install mpg123 or set the config. Current mpg123 executable path is [' + execPath + ']');
                error.code = "LIBRARY_NOT_FOUND";
                return cb(error);
            }
            return cb();
        })
    }
}

module.exports = Player;