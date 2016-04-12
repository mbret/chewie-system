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

class SoundInstance extends EventEmitter {

    constructor(filename, execPath) {
        super();

        this.filename = filename;
        this.execPath = execPath;
        this.sound = null;
    }

    start(){
        var self = this;

        // fire and forget:
        var music = new Sound(this.filename, this.execPath);
        music.play();

        // you can also listen for various callbacks:
        music.on('complete', function () {
            self.emit('complete');
        });

        music.on('stop', function(){

        });

        music.on('pause', function(){

        });

        music.on('resume', function(){

        });
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
}

module.exports = Player;