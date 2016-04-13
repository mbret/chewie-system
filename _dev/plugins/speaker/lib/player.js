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
var util = require('util');

class SoundInstance extends EventEmitter {

    constructor(filename, execPath) {
        super();

        this.filename = filename;
        this.execPath = execPath;
        this.music = new Sound(this.filename, this.execPath);
    }

    start(){
        var self = this;

        this.music.play();

        // you can also listen for various callbacks:
        this.music.on('complete', function () {
            self.emit('complete');
        });

        this.music.on('stop', function(){

        });

        this.music.on('pause', function(){

        });

        this.music.on('resume', function(){

        });

        this.music.on('error', function(err){
            self.emit('error', err);
        });
    }

    stop(){
        this.music.stop();
    }
}

class Player extends EventEmitter {

    constructor(helper, config){
        super();

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
    }

    playFile(filename){

        var self = this;

        // This is what is returned to user
        var soundInstance = new SoundInstance(filename, this.execPath);

        // add silent listener to avoid node process crash
        soundInstance.on('error', function(err){});

        setImmediate(function(){
            Player.CheckFileExist(filename, function(err){
                if(err){
                    soundInstance.emit('error', err);
                    return;
                }

                // add element to the start of queue. It will be the next played
                self.queue.splice(0, 0, soundInstance);
                console.log('There is now ' + self.queue.length + ' sounds in queue');

                // Start the first element in queue
                if(self.queue.length === 1 && !self.playing){

                    self.playing = true;
                    soundInstance.start();

                    // Try to play the next in queue
                    soundInstance.on('complete', function () {
                        self.helper.getLogger().log('Done with playback!');

                        self.playing = false;

                        // Just clear first item in order to not pop this one and play it again
                        self.queue.pop();

                        console.log('Sounds still in queue ' + self.queue.length);

                        // Try to read next in queue
                        var stillInQueue = self.queue.pop();
                        if(typeof stillInQueue !== 'undefined'){
                            self.playing = true;
                            stillInQueue.start();
                        }
                    });
                }
            });
        });

        return soundInstance;
    }

    /**
     *
     * @param helper
     * @param config
     * @param cb
     */
    static Create(helper, config, cb){
        var instance = new Player(helper, config);
        Player.CheckLibrary(instance.execPath, function(err){
            return cb(err, instance);
        });
    }

    static CheckLibrary(execPath, cb){
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

    static CheckFileExist(filename, cb){
        fs.stat(filename, function(err, stat) {
            if(err) {
                if(err.code == 'ENOENT') {
                    err.message = new Error('File does not exist');
                }
                return cb(err);
            }
            return cb();
        });
    }
}

module.exports = Player;