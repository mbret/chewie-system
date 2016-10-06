'use strict';

var MPlayer = require('./mplayer');
var EventEmitter = require("events");

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
            nrj: "http://cdn.nrjaudio.fm/audio1/fr/40101/aac_576.mp3?origine=fluxradios",
        };
    }

    /**
     *
     * @param options
     * @param done
     */
    run(options, done) {
        // Start the radio
        if (this.info.id === "startRadio") {
            this._startRadio(options);
            // the task is done when radio is stopped
            this.once("stop", function() {
                done();
            });
        }
        // Stop the radio
        else if (this.info.id === "stopRadio") {
            this._stopRadio();
            return done();
        }
    }

    stopRadio() {
        if (this.player) {
            this.player.kill();
            this.emit("stop");
        }
    }

    _startRadio(options) {
        var self = this;

        this.player = new MPlayer({verbose: false});
        this.player.on("ready", function() {
            self.player.openFile(self.config[options.radioName]);
        });
    }

    _stopRadio() {
        var tasks = this.helper.getActiveTasksFromMyPlugin();
        tasks.forEach(function(task) {
            // we stop the radio whatever the task type
            task.stopRadio();
        });
    }
}

module.exports = Module;