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
function buddyModule(moduleName, daemon, scheduler, logger, helper){

    class Module extends EventEmitter{

        constructor() {
            super();
            this.name = moduleName;
            this.daemon = daemon;

            // Retrieve module config (the one that can be set by user)
            this.config = daemon.config.userModulesConfig[moduleName];

            this.scheduler = scheduler;
        }

        start(cb){
            var self = this;

            // On new task for this module
            // Get the task object with "options" attribute that is only relative to this module
            self.daemon.on(self.name + ':task:new', function(task, actions){

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

        getOptions(){
            return config.options;
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

    return new Module();
};

// Some components are available and customized for the current module
// Just add Require as static var of the export function with an array of value
// These params will be passed along with the moduleName after it in the same order.
buddyModule.require = ['daemon', 'scheduler', 'logger', 'helper'];

module.exports = buddyModule;
