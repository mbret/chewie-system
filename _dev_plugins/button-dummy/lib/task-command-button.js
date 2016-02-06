'use strict';

var _           = require('lodash');
var config      = require('../config.js');

class Module{

    /**
     *
     * @param helper
     */
    constructor(helper){
        this.helper = helper;
        this.button = null;
    }

    initialize(cb)
    {
        var self = this;

        // create gpio entity
        this.button = this.helper.gpio(17, 'out');

        // new task registered with this command plugin
        this.helper.onNewTaskToTrigger(function(task, cb){

            // Listen for key press
            self._watch(task.options, function(){

                // The key has been pressed, tell ok
                return cb();
            });
        });

        return cb();
    }

    getConfig(){
        return {
            options: [
                {
                    name: 'text',
                    label: 'Touche',
                    type: 'text',
                    required: true,
                }
            ]
        }
    }

    // options contain the key to press, etc
    _watch(options, cb){
        setTimeout(function(){

            return cb();
        }, 3000);
    }
}

module.exports = Module;