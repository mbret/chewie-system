'use strict';

var _ = require('lodash');

class Module {

    constructor(helper){
        this.helper = helper;
    }

    /**
     * Start method. Mandatory !
     */
    initialize(cb){
        var self = this;

        // Listen for new task on module
        this.helper.onNewTask(function(context){

            self._startAlarm(context);
        });

        return cb();
    }

    /**
     *
     * @returns {object}
     */
    getConfig(){
        return {};
    }

    _startAlarm(){
        this.helper.speaker.playFile('foo.mp3');
    }

    _stopAlarm(){

    }
}

module.exports = Module;