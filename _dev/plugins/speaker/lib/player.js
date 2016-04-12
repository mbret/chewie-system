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

    playFile(filename, cb){

        var self = this;
        // add element to the start of queue. It will be the next played
        self.queue.splice(0, 0, filename);
        console.log('There is now ' + self.queue.length + ' sounds in queue');
        if(self.queue.length === 1 && !self.playing){
            self._play(filename, true, cb);
        }
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