'use strict';

var _ = require('lodash');

class Module {

    constructor(helper){
        this.helper = helper;

        // current sound instance
        this.sound = null;
    }

    /**
     * Start method. Mandatory !
     */
    initialize(cb){
        var self = this;

        // Listen for new task on module
        this.helper.onNewTask(function(context){

            if(context.options.action === 'start'){
                self._startAlarm(context);
            }
            else{
                self._stopAlarm(context);
            }
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
        var self = this;
        this.sound = this.helper.speaker.playFile('foo.mp3');
        this.sound.on('error', function(err){
            self.helper.getLogger().error(err);
        });
        //this.sound.on('stop', function(){
        //    self.sound = null;
        //});
    }

    _stopAlarm(){
        if(this.sound !== null){
            this.sound.stop();
            this.sound = null;
        }
    }
}

module.exports = Module;