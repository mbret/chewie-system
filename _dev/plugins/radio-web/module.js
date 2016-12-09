'use strict';

let MPlayer = require('./mplayer');
let EventEmitter = require("events");

class Module extends EventEmitter {

    /**
     *
     * @param helper
     * @param info
     */
    constructor(helper, info) {
        super();
        this.info = info;
        this.player = null;
        this.helper = helper;
        this.config = {
            nrj: "http://cdn.nrjaudio.fm/audio1/fr/40101/aac_576.mp3?origine=fluxradios"
        };
    }

    /**
     *
     * @param options
     * @param done
     */
    run(options, done) {
        let self = this;

        this.helper.logger.debug("Task %s started", self.helper.id);

        // Start the radio
        if (this.info.id === "startRadio") {

            Module.StopRadio(self.helper.shared.lastRunningRadio);
            self.helper.shared.lastRunningRadio = this;

            this.player = self.helper.system.speaker.playFile(self.config[options.radioName]);

            this.player.once("stop", function() {
                self.helper.logger.debug("Task %s stopped", self.helper.id);
                done();
            });
        }
        // Stop the radio
        else if (this.info.id === "stopRadio") {
            Module.StopRadio(self.helper.shared.lastRunningRadio);
            self.helper.shared.lastRunningRadio = null;
            return done();
        }
    }

    /**
     * Stop the current radio
     */
    stop() {
        if (this.player) {
            this.player.stop();
        }
    }

    static StopRadio(radio) {
        if (radio) {
            radio.stop();
        }
    }
}

module.exports = Module;