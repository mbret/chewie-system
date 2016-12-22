"use strict";
const events_1 = require("events");
var MPlayer = require("./mplayer");
class Adapter extends events_1.EventEmitter {
    constructor(system) {
        super();
        var self = this;
        this.logger = system.logger.Logger.getLogger('MPlayerSpeakerAdapter');
        this.player = new MPlayer({ debug: false, args: "-ao win32" });
        this.stopped = false;
        this.ready = false;
        this.lastFile = null;
        this.player
            .once("ready", function () {
            self.ready = true;
        })
            .on("stop", function () {
            self.emit("stop");
            self.stopped = true;
        })
            .on("error", function (err) {
            self.logger.error("An error occurred with mplayer while trying to play %s (Note that it may still be played) => %s", self.lastFile, err);
        });
    }
    stop() {
        if (!this.stopped) {
            this.player.stop();
        }
        return this;
    }
    play(file) {
        this.lastFile = file;
        if (this.ready) {
            this.player.openFile(file);
        }
        else {
            this.player.once("ready", this.play.bind(this, file));
        }
        return this;
    }
}
exports.Adapter = Adapter;
