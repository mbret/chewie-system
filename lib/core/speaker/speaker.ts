'use strict';

var taskQueue = require('my-buddy-lib').taskQueue;
import {Daemon} from "../../daemon";
import {EventEmitter} from "events";
var Mplayer = require("./mplayer");
var path = require("path");
const Flowrida = require('flowrida');

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

class SpeakerInstance extends EventEmitter {
    constructor(player) {
        super();
        var self = this;
        this.player = player;
        this.player.on("stop", function() {
             self.emit("stop");
        });
    }
    stop() {
        this.player.kill();
    }
}

/**
 *
 */
export class Speaker {

    system: Daemon;
    logger: any;
    currentInstance: any;

    constructor(system){
        var self = this;
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('Speaker');

        // Adapter used to play sound file on speaker
        //this.speakerAdapter = null;

        // Adapter used to convert text to sound file
        this.textToSpeechAdapter = null;
        this.currentInstance = null;
    }

    //setAdapter(adapter){
    //    this.speakerAdapter = adapter;
    //}

    setTextToSpeechAdapter(textToSpeechAdapter) {
        this.textToSpeechAdapter = textToSpeechAdapter;
    }

    //registerSpeakerAdapter(adapter, cb) {
    //    var self = this;
    //    adapter.initialize(function(err){
    //        if(err){
    //            return cb(err);
    //        }
    //        self.setAdapter(adapter);
    //
    //        return cb();
    //    });
    //}

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
     * @param {object} options
     * @returns {*}
     */
    playFile(filename, options = {}) {
        var self = this;
        var delay = options.delay || 0;
        var filename = filename.replace(new RegExp('\\' + path.sep, 'g'), '/');
        var instance = new SpeakerInstance(new Mplayer());
        this.logger.debug("File %s requested to play", filename);

        instance.once("stop", function() {
            instance = null;
        });

        // kill possible previous player
        if (self.currentInstance) {
            self.currentInstance.stop();
        }
        // create new player
        self.currentInstance = instance;

        instance.player.once("ready", function() {
            self.logger.debug('Playing sound file %s', filename);
            instance.player.openFile(filename);
        });

        return instance;
        //var sound = this.speakerAdapter.playFile(filename);
        //
        //sound.on('error', function(err){
        //    self.logger.error('An error happened while playing file %s. Err:', filename, err);
        //});

        // watch for system stop
        // stop the current sound (running or not) to avoid having mpg123 playing sound
        // even if system is not running.
        //taskQueue.register('shutdown', function(cb){
        //    sound.close();
        //    return cb();
        //});

        //return sound;
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

    kill() {
    //    if(this.speakerAdapter === null){
    //        return;
    //    }
    //    this.speakerAdapter.kill();
    }
}