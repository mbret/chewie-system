'use strict';

var taskQueue = require('my-buddy-lib').taskQueue;
var EventEmitter = require("events");

/**
 * This fake sound is used when adapter is not available or not working.
 * In some system we may not need sound output and the system has to run well.
 * In order to not break the code we just return a fake sound instance which is closed & complete.
 */
class FakeSound extends EventEmitter {

    constructor() {
        super();
        var self = this;
        setImmediate(function() {
            self.emit("complete");
            self.emit("closed");
        });
    }

    close() {
        // nothing
    }
}

/**
 * This class is used to output sound.
 * It works only by using an adapter that provide various method.
 * For now we can use only one speaker adapter at a time.
 *
 * The adapter is a user module that has some methods.
 *  .playText() => play simple string to the speakers
 *  .playFile() => play file to the speakers
 */
class Speaker{

    constructor(system){
        this.system = system;
        this.logger = MyBuddy.logger.Logger.getLogger('Speaker');

        // Adapter used to play sound file on speaker
        this.speakerAdapter = null;

        // Adapter used to convert text to sound file
        this.textToSpeechAdapter = null;
    }

    setAdapter(adapter){
        this.speakerAdapter = adapter;
    }

    setTextToSpeechAdapter(textToSpeechAdapter) {
        this.textToSpeechAdapter = textToSpeechAdapter;
    }

    /**
     * Register a register.
     * @param adapter the adapter instance
     * @param cb
     */
    registerSpeakerAdapter(adapter, cb) {
        var self = this;
        adapter.initialize(function(err){
            if(err){
                return cb(err);
            }
            self.setAdapter(adapter);

            return cb();
        });
    }

    registerTextToSpeechAdapter(Adapter, cb) {
        var self = this;
        var adapter = new Adapter(this.system);
        adapter.initialize(function(err){
            if(err){
                return cb(err);
            }
            self.setTextToSpeechAdapter(adapter);

            return cb();
        });
    }

    /**
     * Automatically play the audio file and return a sound instance.
     *
     * @param filename
     * @returns {*}
     */
    playFile(filename){
        var self = this;
        this.logger.debug('Playing sound file %s', filename);

        if(!this.speakerAdapter){
            return new FakeSound();
        }

        var sound = this.speakerAdapter.playFile(filename);

        sound.on('error', function(err){
            self.logger.error('An error happened while playing file %s. Err:', filename, err);
        });

        // watch for system stop
        // stop the current sound (running or not) to avoid having mpg123 playing sound
        // even if system is not running.
        taskQueue.register('shutdown', function(cb){
            sound.close();
            return cb();
        });

        return sound;
    }

    playUrl(url) {
        var self = this;
        this.logger.debug('Playing url %s', url);

        if(!this.speakerAdapter){
            return new FakeSound();
        }

        var sound = this.speakerAdapter.playUrl(url);

        sound.on('error', function(err){
            self.logger.error('An error happened while playing file %s. Err:', url, err);
        });

        // watch for system stop
        // stop the current sound (running or not) to avoid having mpg123 playing sound
        // even if system is not running.
        taskQueue.register('shutdown', function(cb){
            sound.close();
            return cb();
        });

        return sound;
    }

    /**
     * Play a text.
     * @param text
     * @returns {*|Promise.<T>}
     */
    play(text) {
        var self = this;

        self.logger.debug('Playing text "%s"', text);
        return this.textToSpeechAdapter.extract(text)
            .then(function(filename) {
                return Promise.resolve(self.playFile(filename));
            })
            .catch(function(err) {
                self.logger.debug('An error happened while playing text %s. Err:', text, err);
                throw err;
            });
    }

    kill(){
        if(this.speakerAdapter === null){
            return;
        }
        this.speakerAdapter.kill();
    }
}

module.exports = Speaker;