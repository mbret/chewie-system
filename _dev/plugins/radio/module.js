'use strict';

var MPlayer = require('mplayer');
var player = new MPlayer();

class Module {

    constructor(helper) {
        this.helper = helper;
        this.config = {
            nrj: "http://cdn.nrjaudio.fm/audio1/fr/40101/aac_576.mp3?origine=fluxradios",
            // nrj: "C:/Users/maxime/Desktop/test.mp3"
        };
    }

    initialize(cb){
        return cb();
    }

    /**
     * On module destroy.
     * @returns {*}
     */
    destroy() {
        return Promise.resolve();
    }

    newTask(task) {
        var self = this;

        // Each time the task is executed by a trigger
        task.on('execute', function(context){
            console.log("new radio task executed");
            player.openFile(self.config[context.options.radioName]);

            context.on("stop", function() {
                console.log("radio stop");
                player.stop();
            });
        });
    }
}

module.exports = Module;