'use strict';

var _           = require('lodash');
var nodemailer  = require('nodemailer');
var wellknown   = require('nodemailer-wellknown');
var config      = require('./config.js');
var EventEmitter = require('events').EventEmitter;

class Module extends EventEmitter{

    /**
     *
     * @param helper
     */
    constructor(helper){
        super();
        this.helper = helper;
    }

    initialize(cb)
    {
        var self = this;
        // run speech api system
        // listen for vocal

        // open socket api with smartphone
        // listen for voice detection

        // detected text
        setTimeout(function(){
            self.emit('text:new', 'coucou');
        }, 10000);

        return cb();
    }
}

module.exports = Module;