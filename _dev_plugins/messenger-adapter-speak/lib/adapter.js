'use strict';

var _ = require('lodash');
var Player  = require('./player.js');
var internalConfig = require(__dirname + '/../config.js');
var EventEmitter = require('events').EventEmitter;

/**
 * This module allow modules to plays sound to speaker.
 * It listen for 'play' event and take a string as parameter. Then it output the text on speakers.
 *
 * For example inside your module:
 *  this.emit('play', 'hello');
 */
class Module{

    constructor(helper)
    {
        var self = this;
        this.daemon = helper.getDaemon();
        this.logger = helper.getLogger();
        //this.scheduler = scheduler;
        this.config = _.merge(internalConfig);
        this.sound  = null;
        this.helper = helper;

        /**
         * This module is compatible with sleep-time module.
         * It will not play any sound when we are on sleep time.
         * @type {boolean}
         */
        this.sleepTime = false;
        this.daemon.on('sleep', function(){
            self.sleepTime = true;
        });
        this.daemon.on('wakeUp', function(){
            self.sleepTime = false;
        });
    }

    getConfig(){
        return {

        };
    }

    /**
     * At this point all the core modules and user modules has been instantiated.
     * Core modules are being started and user modules are waiting for them before starting then.
     */
    initialize(cb)
    {
        var self = this;
        Player(this.logger).create(this.daemon, this.config, function(err, instance){
            if(err){
                return cb(err);
            }
            self.sound = instance;
            return cb();
        });
    }

    execute(message){
        if(!_.isString(message)){
            this.logger.warn('_play: text is not a string.', message);
            return;
        }
        var self = this;
        if(!self.sleepTime){
            self.logger.verbose('play sound %s', message);
            self.sound.play(message, function(err){
                if(err){
                    self.logger(err);
                    throw err;
                }
            });
        }
    }

}

Module.require = ['daemon', 'scheduler', 'logger', 'helper'];

module.exports = Module;