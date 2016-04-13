'use strict';

var _ = require('lodash');
var path = require('path');
var config = require('./config.js');

/**
 * This is possible to have only one alarm at a time.
 * If an alarm is running and other task are received they are ignored.
 */
class Module {

    constructor(helper){
        this.helper = helper;

        // current sound instance
        this.sound = null;

        this.running = false;
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

            context.task.on('stopped', function(){
                self._stopAlarm(context);
            });
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

    /**
     *
     * @param context
     * @private
     */
    _startAlarm(context){
        this.helper.getLogger().info('Start alarm for task', context);

        // For now only one alarm at a time
        if(this.running){
            this.helper.getLogger().info('Alarm already running, task ignored');
            return;
        }

        this.running = true;

        var self = this;
        this.sound = this.helper.speaker.playFile(path.resolve(__dirname, config.samples[1]));
        this.sound.on('error', function(err){
            self.helper.getLogger().error('Unable to play alarm: ' + err);
        });
        this.sound.on('complete', function(err){
            if(context.options.repeat === true){
                setTimeout(function(){
                    // alarm may be stopped since last time
                    if(self.sound){
                        self.sound.play();
                    }
                }, 2000);
            }
            else{
                self._stopAlarm(context);
            }
        });
    }

    /**
     *
     * @param context
     * @private
     */
    _stopAlarm(context){
        // If any sound instance exist, stop it
        if(this.sound !== null){
            this.sound.stop();
            this.sound = null;
        }

        if(this.running){
            this.helper.getLogger().info('Current alarm stopped');
        }

        this.running = false;
    }
}

module.exports = Module;