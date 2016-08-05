'use strict';

var moment = require('moment');
var _      = require('lodash');
var config = require('./config.js');
var EventEmitter = require('events').EventEmitter;

/**
 *
 * @param moduleName Always passed
 * @param daemon .Required
 * @param scheduler .Required
 * @param logger .Required
 */
class Module extends EventEmitter{

    constructor(helper){
        super();
        this.helper = helper;
    }

    initialize(cb){
        var self = this;

        // Listen for new task on module
        this.helper.onNewTask(function(task){
            var time = null;

            switch(task.options.format){
                case 'hours':
                    time = self._giveTime();
                    break;

                case 'moment':
                    time = self._giveMoment();
                    break;

                default :
                    logger.debug('Task with no format (unrecognized?) options provided, ignored!', task);
                    return;
                    break;
            }

            self.emit('action:execute', actions, time);
        });

        return cb();
    }

    getConfig(){
        return config;
    }

    _giveTime(){
        var self = this;
        var nowTime = moment(new Date());
        var sentence = "Il est [hours] heures [minutes]";
        sentence = sentence
            .replace('[hours]', nowTime.hour())
            .replace('[minutes]', nowTime.minute())
            .replace('0 heures', 'minuit');

        return sentence;
    }

    _giveMoment(){
        var self = this;
        var sentence = "Nous sommes le 10 Janvier et " + self._giveTime();
        return sentence;
    }

}

module.exports = Module;
