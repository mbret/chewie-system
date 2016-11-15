'use strict';

var taskQueue = require('my-buddy-lib').taskQueue;
import {Daemon} from "../../daemon";
import {EventEmitter} from "events";
var TextToSpeechAdapter = require("./adapters/default-text-to-speech-adapter/index");
import {Adapter as MplayerSpeakerAdapter} from "./adapters/mplayer-speaker-adapter/adapter";
var path = require("path");
let self;
/**
 * This fake sound is used when adapter is not available or not working.
 * In some system we may not need sound output and the system has to run well.
 * In order to not break the code we just return a fake sound instance which is closed & complete.
 */
// class FakeSound extends EventEmitter {
//
//     constructor() {
//         super();
//         var self = this;
//         setImmediate(function() {
//             self.emit("complete");
//             self.emit("closed");
//         });
//     }
//
//     close() {
//         // nothing
//     }
// }

export class Speaker {

    system: Daemon;
    logger: any;
    // current player instance. We do not play two main sound at the same time. Once a new sound is requested the current
    // instance is automatically closed
    currentInstance: any;
    // Adapter used to convert text to sound file
    textToSpeechAdapter: any;

    constructor(system) {
        self = this;
        this.system = system;
        this.logger = this.system.logger.getLogger('Speaker');
        this.currentInstance = null;
        this.textToSpeechAdapter = null;
    }

    /**
     *
     * @returns {Promise}
     */
    initialize() {
        return new Promise(function(resolve, reject) {
            self.textToSpeechAdapter = new TextToSpeechAdapter(self.system);
            self.textToSpeechAdapter.initialize(function(err) {
                if (err) {
                    return reject(err);
                } else {
                    return resolve();
                }
            });
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
        var filename = filename.replace(new RegExp('\\' + path.sep, 'g'), '/');
        var instance = new MplayerSpeakerAdapter(this.system);
        this.logger.debug("File %s requested to play", filename);

        instance.once("stop", function() {
            self.currentInstance = null;
        });

        instance.once("error", function(err) {
            self.logger.error(err);
            self.currentInstance = null;
        });

        // kill possible previous player
        if (self.currentInstance) {
            self.currentInstance.stop();
        }

        // create new player
        self.currentInstance = instance;

        self.logger.debug('Playing sound file %s', filename);
        instance.play(filename);

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

    // playUrl(url) {
    //     var self = this;
    //     this.logger.debug('Playing url %s', url);
    //
    //     if(!this.speakerAdapter){
    //         return new FakeSound();
    //     }
    //
    //     var sound = this.speakerAdapter.playUrl(url);
    //
    //     sound.on('error', function(err){
    //         self.logger.error('An error happened while playing file %s. Err:', url, err);
    //     });
    //
    //     // watch for system stop
    //     // stop the current sound (running or not) to avoid having mpg123 playing sound
    //     // even if system is not running.
    //     taskQueue.register('shutdown', function(cb){
    //         sound.close();
    //         return cb();
    //     });
    //
    //     return sound;
    // }

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