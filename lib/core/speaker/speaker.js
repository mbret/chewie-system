'use strict';
var taskQueue = require('my-buddy-lib').taskQueue;
var TextToSpeechAdapter = require("./adapters/default-text-to-speech-adapter/index");
const adapter_1 = require("./adapters/mplayer-speaker-adapter/adapter");
var path = require("path");
let self;
class Speaker {
    constructor(system) {
        self = this;
        this.system = system;
        this.logger = this.system.logger.getLogger('Speaker');
        this.currentInstance = null;
        this.textToSpeechAdapter = null;
    }
    initialize() {
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
    }
    playFile(filename, options = {}) {
        var self = this;
        var filename = filename.replace(new RegExp('\\' + path.sep, 'g'), '/');
        var instance = new adapter_1.Adapter(this.system);
        this.logger.debug("File %s requested to play", filename);
        instance.once("stop", function () {
            self.currentInstance = null;
        });
        instance.once("error", function (err) {
            self.logger.error(err);
            self.currentInstance = null;
        });
        if (self.currentInstance) {
            self.currentInstance.stop();
        }
        self.currentInstance = instance;
        self.logger.debug('Playing sound file %s', filename);
        instance.play(filename);
        return instance;
    }
    play(text) {
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
    }
    kill() {
    }
}
exports.Speaker = Speaker;
