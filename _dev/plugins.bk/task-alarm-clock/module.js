'use strict';

var _ = require('lodash');
var path = require('path');
var config = require('./config.js');
var util = require('util');

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

        // When a new task is registered
        this.helper.on('new:task', function(task){

            // When the task is being executed (with a specific context trigger)
            task.on('execute', function(trigger){
                if(trigger.getOptions().action === 'start'){
                    self._startAlarm(trigger);
                }
                else{
                    self._stopAlarm(trigger);
                }
            });

            // When the task is being stopped and destroyed
            // This task will no longer exist.
            task.on('stopped', function(){
                self._stopAlarm();
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
        this.helper.getLogger().info('Start alarm for task %s with context options %s', JSON.stringify(context.getTask().toJSON()), JSON.stringify(context.getOptions()));

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
            if(context.getOptions().repeat === true){
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
            this.helper.getLogger().debug('Current alarm stopped');
            this.helper.notify('info', 'Alarm stopped');
        }

        this.running = false;
    }
}

module.exports = Module;