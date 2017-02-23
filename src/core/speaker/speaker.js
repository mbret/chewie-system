'use strict';
var taskQueue = require('my-buddy-lib').taskQueue;
var TextToSpeechAdapter = require("./adapters/default-text-to-speech-adapter/index");
var adapter_1 = require("./adapters/mplayer-speaker-adapter/adapter");
var path = require("path");
var self;
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
var Speaker = (function () {
    function Speaker(system) {
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
    Speaker.prototype.initialize = function () {
        return new Promise(function (resolve, reject) {
            self.textToSpeechAdapter = new TextToSpeechAdapter(self.system);
            self.textToSpeechAdapter.initialize(function (err) {
                if (err) {
                    return reject(err);
                }
                else {
                    return resolve();
                }
            });
        });
    };
    /**
     * Automatically play the audio file and return a sound instance.
     *
     * @param filename
     * @param {object} options
     * @returns {*}
     */
    Speaker.prototype.playFile = function (filename, options) {
        if (options === void 0) { options = {}; }
        filename = path.resolve(filename).replace(new RegExp('\\' + path.sep, 'g'), '/');
        return this.playFileOrUrl(filename, options);
    };
    Speaker.prototype.playUrl = function (url, options) {
        if (options === void 0) { options = {}; }
        return this.playFileOrUrl(url, options);
    };
    Speaker.prototype.playFileOrUrl = function (path, options) {
        if (options === void 0) { options = {}; }
        var self = this;
        var events = require('events');
        var instance = new adapter_1.Adapter(this.system);
        // let instance = events();
        this.logger.debug("File %s requested to play", path);
        instance.once("stop", function () {
            if (self.currentInstance === instance) {
                self.currentInstance = null;
            }
        });
        instance.once("error", function (err) {
            self.logger.error(err);
            if (self.currentInstance === instance) {
                self.currentInstance = null;
            }
        });
        // kill possible previous player
        if (self.currentInstance) {
            self.currentInstance.stop();
        }
        // create new player
        self.currentInstance = instance;
        self.logger.debug('Playing sound file %s', path);
        instance.play(path);
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
    };
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
    Speaker.prototype.play = function (text) {
        var self = this;
        self.logger.debug('Playing text "%s"', text);
        return this.textToSpeechAdapter.extract(text)
            .then(function (filename) {
            return Promise.resolve(self.playFile(filename));
        })
            .catch(function (err) {
            self.logger.debug('An error happened while playing text %s. Err:', text, err);
            throw err;
        });
    };
    Speaker.prototype.kill = function () {
        //    if(this.speakerAdapter === null){
        //        return;
        //    }
        //    this.speakerAdapter.kill();
    };
    return Speaker;
}());
exports.Speaker = Speaker;
