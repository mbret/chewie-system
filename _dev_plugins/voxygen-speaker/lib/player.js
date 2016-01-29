'use strict';

'use strict';

var request = require('request');
var fs      = require('fs');
var crypto = require('crypto');
var voxygenBasePath = "http://www.voxygen.fr/sites/all/modules/voxygen_voices/assets/proxy/index.php?method=redirect&voice=:voice&text=:text";
var OS = require('os');
var path = require('path');
var Sound = require('./node-mpg123.js');
var childProcess = require('child_process');


module.exports = function(logger){
    class Player{

        /**
         *
         * @param daemon
         * @param config
         * @param logger
         * @param cb
         * @returns {*}
         */
        static create(daemon, config, cb){
            var instance = new Player(daemon, config);
            Player.checkLibrary(instance.execPath, function(err){
                if(err){
                    return cb(err);
                }
                return cb(null, instance);
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
            var spawn = childProcess.spawn;
            var ls = spawn(path.normalize(execPath), ['-?']);
            ls.on('error', function(code){
                console.log(code);
                return cb(new Error('Please install mpg123 or set the config. Current mpg123 executable path is [' + execPath + ']'));
            });
            ls.on('close', function(){
                return cb();
            })
        }

        //static Windows = function(){
        // Use embedded exe path for windows
        //return this.Abstract(__dirname + '/mpg123/mpg123');
        //return this.Abstract(path.normalize('C:/Program Files (x86)/mpg123/mpg123'));
        //return this.Abstract();
        //};

        //static Linux = function(){
        //    return this.Abstract();
        //};

        constructor(daemon, config){
            this.queue = [];
            this.daemon = daemon;
            this.execPath = 'mpg123';

            if(config.binaryPath){
                this.execPath = path.normalize(config.binaryPath);
            }

            //if(OS.platform() === "linux"){
            //    logger.verbose('Sound player for Linux loaded');
            //    this.player = this.Linux();
            //}
            //else if(OS.platform() === "win32"){
            //    logger.verbose('Sound player for Windows loaded');
            //    this.player =  this.Windows();
            //}
            //else{
            //    throw new Error('Platform not supported for player');
            //}

            // This boolean avoid to play song when queue is empty but a song is still playing.
            // It's then useful only in this particular situation
            this.playing = false;

            // The garbage clean the tmp folder after some times
            this.garbage = new GarbageCollector();
            this.tmpDirPattern = daemon.config.tmpDir + '/:voice-:text.mp3';

            logger.debug('Using [%s] as tmp dir and pattern', this.tmpDirPattern);

            // Load voice
            if(!config.voice || !Player.VOICES[config.voice]){
                logger.debug('No voice selected, use Melodine by default');
                this.voice = Sound.VOICES['Melodine'];
            }
            else{
                this.voice = Player.VOICES[config.voice];
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
                logger.log('Done with playback!');

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
            var url = voxygenBasePath.replace(':voice', voice).replace(':text', encodeURI(text));
            var fileName = this.daemon.config.tmpDir + '/:voice-:text.mp3'.replace(':voice', voice).replace(':text', textMd5);

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

    }

    // 'Elizabeth', u'Adel', u'Bronwen', u'Eva', u'Marta', u'Guy', u'PapaNoel', u'Papi', u'Philippe', u'Ramboo', u'Robot', u'Sidoo', u'Sorciere', u'Stallone', u'Yeti', u'Zozo', u'Pedro', u'Helene', u'Paul', u'Sonia', u'Emma', u'Ludovic', u'Michel', u'Fabienne', u'Matteo', u'Emma', u'Judith', u'Martha', u'Becool', u'Chuchoti', u'Dark', u'Jean', u'Alain', u'Papy_Noel', u'Sylvester', u'Stallone', u'Moussa', u'Mendoo', u'Witch']. got 'qsd'
    Player.VOICES = {
        Dark: 'Dark',
        Sorciere: 'Sorciere',
        Phil: 'Phil',
        Sylvia: "Sylvia",
        Agnes: "Agnes",
        Loic: "Loic",
        Damien: "Damien",
        Becool: "Becool",
        Chut: "Chut",
        DarkVadoor: "DarkVadoor",
        Electra: "Electra",
        JeanJean: "JeanJean",
        John: "John",
        Melodine: "Melodine",
    };

    class GarbageCollector{

    }

    return Player;
};
