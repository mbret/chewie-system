'use strict';

var MPlayer = require('mplayer');
var player = new MPlayer();
var EventEmitter = require("events");
var scheduler = require('node-schedule');

class Module {

    constructor(helper) {
        this.helper = helper;
        this.config = {
            nrj: "http://cdn.nrjaudio.fm/audio1/fr/40101/aac_576.mp3?origine=fluxradios",
            // nrj: "C:/Users/maxime/Desktop/test.mp3"
        };
    }

    initialize(cb){
        var self = this;
        // @todo dev
        class Task extends EventEmitter {

        }
        var task = new Task();
        task.options = {radioName: "nrj"};

        var rule = new scheduler.RecurrenceRule();
        rule.hour = 9;
        rule.minute = 0;
        rule.dayOfWeek = [1,2,3,4,5];
        scheduler.scheduleJob(rule, function(){
            self.newTask(task);
        });
        // @todo fin dev

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

        console.log("new radio task executed");
        player.openFile(self.config[task.options.radioName]);

        // Each time the task is executed by a trigger
        task.once('stop', function() {
            console.log("radio stop");
            player.stop();
        });
    }
}

module.exports = Module;