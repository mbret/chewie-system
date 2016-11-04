'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var taskQueue = require('my-buddy-lib').taskQueue;
var events_1 = require("events");
var Mplayer = require("./mplayer");
var path = require("path");
/**
 * This fake sound is used when adapter is not available or not working.
 * In some system we may not need sound output and the system has to run well.
 * In order to not break the code we just return a fake sound instance which is closed & complete.
 */
var FakeSound = (function (_super) {
    __extends(FakeSound, _super);
    function FakeSound() {
        _super.call(this);
        var self = this;
        setImmediate(function () {
            self.emit("complete");
            self.emit("closed");
        });
    }
    FakeSound.prototype.close = function () {
        // nothing
    };
    return FakeSound;
}(events_1.EventEmitter));
var SpeakerInstance = (function (_super) {
    __extends(SpeakerInstance, _super);
    function SpeakerInstance(player) {
        _super.call(this);
        var self = this;
        this.player = player;
        this.stopped = false;
        this.player
            .on("stop", function () {
            self.emit("stop");
            self.stopped = true;
        })
            .on("error", function (err) {
            self.emit("error", err);
        });
    }
    SpeakerInstance.prototype.stop = function () {
        if (!this.stopped) {
            this.player.stop();
        }
        return this;
    };
    return SpeakerInstance;
}(events_1.EventEmitter));
/**
 *
 */
var Speaker = (function () {
    function Speaker(system) {
        var self = this;
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('Speaker');
        // Adapter used to convert text to sound file
        this.textToSpeechAdapter = null;
        this.currentInstance = null;
    }
    Speaker.prototype.setTextToSpeechAdapter = function (textToSpeechAdapter) {
        this.textToSpeechAdapter = textToSpeechAdapter;
    };
    Speaker.prototype.registerTextToSpeechAdapter = function (Adapter, cb) {
        var self = this;
        var adapter = new Adapter(this.system);
        adapter.initialize(function (err) {
            if (err) {
                return cb(err);
            }
            self.setTextToSpeechAdapter(adapter);
            return cb();
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
        var self = this;
        var filename = filename.replace(new RegExp('\\' + path.sep, 'g'), '/');
        var instance = new SpeakerInstance(new Mplayer({ debug: false, args: "-ao win32" }));
        this.logger.debug("File %s requested to play", filename);
        instance.once("stop", function () {
            self.currentInstance = null;
        });
        instance.once("error", function (err) {
            self.logger.error(err);
            self.currentInstance = null;
        });
        // kill possible previous player
        if (self.currentInstance) {
            self.currentInstance.stop();
        }
        // create new player
        self.currentInstance = instance;
        instance.player.once("ready", function () {
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
    };
    Speaker.prototype.playUrl = function (url) {
        var self = this;
        this.logger.debug('Playing url %s', url);
        if (!this.speakerAdapter) {
            return new FakeSound();
        }
        var sound = this.speakerAdapter.playUrl(url);
        sound.on('error', function (err) {
            self.logger.error('An error happened while playing file %s. Err:', url, err);
        });
        // watch for system stop
        // stop the current sound (running or not) to avoid having mpg123 playing sound
        // even if system is not running.
        taskQueue.register('shutdown', function (cb) {
            sound.close();
            return cb();
        });
        return sound;
    };
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
