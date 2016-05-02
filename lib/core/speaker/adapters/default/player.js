'use strict';

var request             = require('request');
var fs                  = require('fs');
var crypto              = require('crypto');
var OS                  = require('os');
var path                = require('path');
var Sound               = require('./node-mpg123.js');
var childProcess        = require('child_process');
var GarbageCollector    = require('./garbage-collector.js');
const EventEmitter      = require('events');
var Mpg = require('mpg123');
var util = require('util');

class SoundInstance extends EventEmitter {

    /**
     * Events:
     *  'stopped': when sound is completly stopped
     *  'stop': when sound is asked to stop
     *
     * @param filename
     * @param execPath
     */
    constructor(filename, execPath) {
        super();

        // when set to true the object should be detroyed, not user anymore
        this.closed = false;

        this.filename = filename;
        this.execPath = execPath;
        this.music = new Sound(this.filename, this.execPath);
        //this.music = new Mpg();
        this.stopped = false;

        var self = this;

        // you can also listen for various callbacks:
        this.music.on('complete', function () {
            self.emit('complete');
        });

        this.music.on('stop', function(){
            self.emit('stopped');
        });

        this.music.on('pause', function(){

        });

        this.music.on('resume', function(){

        });

        this.music.on('error', function(err){
            self.emit('error', err);
            self.emit('complete', err);
        });
    }

    play(){
        this.stopped = false;
        var self = this;

        //this.emit('play');

        Player.CheckFileExist(this.filename, function(err){
            if(err){
                self.emit('error', err);
                return;
            }

            // process has been stopped while running start
            if(self.stopped || self.music === null){
                return;
            }

            self.music.play(self.filename);
        });

        return this;
    }

    stop(){
        // already stopped
        //if(this.stopped){
        //    return this;
        //}

        this.stopped = true;
        //this.emit('stop');

        this.music.stop();
        return this;
    }

    pause(){

    }

    close(){
        if(this.music){
            this.music.close();
            this.music = null;
            this.closed = true;
            this.emit('closed');
        }
        return this;
    }
}

class Player extends EventEmitter {

    constructor(system, logger, config){
        super();

        this.system = system;
        this.logger = logger;
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
    }

    playFile(filename){

        var self = this;

        // This is what is returned to user
        var soundInstance = new SoundInstance(filename, this.execPath);

        // add silent listener to avoid node process crash
        soundInstance.on('error', function(err){});

        // As we directly return sound instance
        // user may want to cancel the sound next.
        // We need to know that in order to not start the sound to
        //var userDirectlyStopped = false;
        //soundInstance.once('stop', function(){
        //    userDirectlyStopped = true;
        //});

        soundInstance.play();

        return soundInstance;

        //setImmediate(function(){
            //Player.CheckFileExist(filename, function(err){
            //    if(err){
            //        soundInstance.emit('error', err);
            //        return;
            //    }
        //
        //        if(!userDirectlyStopped){
        //            soundInstance.start();
        //        }
        //        return;
        //
        //        self.logger.debug('One sound added to queue');
        //
        //        // add element to the start of queue. It will be the next played
        //        self.queue.splice(0, 0, soundInstance);
        //        //self.logger.debug('There is now ' + self.queue.length + ' sounds in queue');
        //
        //        // Start the first element in queue
        //        if(self.queue.length === 1 && !self.playing){
        //
        //            //self.logger.debug('Play the first song of queue');
        //
        //            // Just clear first item in order to not pop this one and play it again
        //            self.queue.pop();
        //
        //            self._playQueue(soundInstance);
        //        }
        //    });
        ////});
        //
        //return soundInstance;
    }

    kill(){

    }

    _playQueue(soundInstance){
        var self = this;
        this.playing = true;

        soundInstance.start();

        // Try to play the next in queue
        soundInstance.on('complete', function (err) {
            //self.logger.debug('current sound complete');

            self.playing = false;

            //self.logger.debug('Sounds still in queue ' + self.queue.length);

            // Try to read next in queue
            var stillInQueue = self.queue.pop();
            if(typeof stillInQueue !== 'undefined'){
                self._playQueue(stillInQueue);
            }
        });
    }

    /**
     * Create the player instance
     *
     * @param system
     * @param logger
     * @param config
     * @param cb
     * @constructor
     */
    static Create(system, logger, config, cb){
        var instance = new Player(system, logger, config);
        Player.CheckLibrary(instance.execPath, function(err){
            return cb(err, instance);
        });
    }

    static CheckLibrary(execPath, cb){
        const spawn = childProcess.spawn;
        const ls = spawn(path.normalize(execPath), ['-?']);

        ls.on('error', function(error){
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

    static CheckFileExist(filename, cb){
        fs.stat(filename, function(err, stat) {
            if(err) {
                if(err.code == 'ENOENT') {
                    err.message = new Error('File ' + filename + ' does not exist');
                }
                return cb(err);
            }
            return cb();
        });
    }
}

module.exports = Player;