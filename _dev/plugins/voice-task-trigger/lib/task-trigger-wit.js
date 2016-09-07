'use strict';

var _           = require('lodash');
var config      = require('../config.js');
var wit = require('node-wit');
var ACCESS_TOKEN = "LA3HR6GBPU3DCUS423ESX2NQEVAPFEYA";
var fs = require('fs');

class Module{

    /**
     *
     * @param helper
     */
    constructor(helper){
        this.helper = helper;
    }

    initialize(cb)
    {
        var self = this;

        // new task registered with this command plugin
        // this.helper.onNewTaskToTrigger(function(task, cb){
        //
        //     return cb();
        //
        // });

        // Listen for new voice recorded event
        MyBuddy.on('voice:recorded:new', function(file){

            var stream = fs.createReadStream('./sample.wav');
            wit.captureSpeechIntent(ACCESS_TOKEN, stream, "audio/wav", function (err, res) {
                console.log("Response from Wit for audio stream: ");
                if (err) console.log("Error: ", err);
                console.log(JSON.stringify(res, null, " "));
            });
        });

        return cb();
    }
}

module.exports = Module;