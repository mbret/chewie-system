"use strict";
const events_1 = require("events");
let MPlayer = require("./mplayer");
let os = require("os");
class Adapter extends events_1.EventEmitter {
    constructor(system) {
        super();
        let self = this;
        this.logger = system.logger.getLogger('MPlayerSpeakerAdapter');
        let options = { debug: false };
        if (os.platform() === "win32") {
            options.args = "-ao win32";
        }
        this.player = new MPlayer(options);
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
            self.logger.warn("An error occurred with mplayer while trying to play %s (Note that it may still be played) => %s", self.lastFile, err);
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
//# sourceMappingURL=adapter.js.map