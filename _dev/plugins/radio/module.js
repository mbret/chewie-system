'use strict';

var MPlayer = require('mplayer');
var player = new MPlayer();

class Module {

    constructor(helper){
        this.helper = helper;
        this.config = {
            nrj: "http://cdn.nrjaudio.fm/audio1/fr/40101/aac_576.mp3?origine=fluxradios"
        };
    }

    initialize(cb){
        return cb();
    }

    destroy(cb) {
        return cb();
    }

    newTask(task) {
        var self = this;
        task.on('execute', function(context){
            player.openFile(self.config[context.options.radioName]);
        });

        task.on('stopped', function(){

        });
    }
}

module.exports = Module;