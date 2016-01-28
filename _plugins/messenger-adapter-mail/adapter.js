'use strict';

var _           = require('lodash');
var nodemailer  = require('nodemailer');
var wellknown   = require('nodemailer-wellknown');
var config      = require('./config.js');

class Module{

    /**
     *
     * @param helper
     */
    constructor(helper){
        var self = this;
        this.logger = helper.getLogger();
        this.config = config;
        this.userConfig = helper.getUserConfig();
        this.helper = helper;
        this.transporter = this._createTransporter();

        // Set system config
        this.helper.setConfig(this.config.adapter);

        this.helper.onUserConfigChange(function(){
            self.userConfig = helper.getUserConfig();
            // update transporter
            self.transporter = self._createTransporter();
        });
    }

    initialize(cb)
    {
        return cb();
    }

    execute(message){
        var self = this;
        var mailOptions = {
            from: 'My buddy',
            to: self.userConfig.options.mailTo,
            subject: 'Nouveau message !',
            html: '<b>' + message + '</b>'
        };

        if(this.transporter === null){
            self.helper.notify('warn', 'Please provide valids options');
            return;
        }

        this.transporter.sendMail(mailOptions, function(error, info){
            if(error){
                self.helper.notify('error', error);
                return;
            }
            self.helper.notify('info', 'Mail sent to ' + mailOptions.to);
        });
    }

    _createTransporter(){
        var self = this;
        if(!self.userConfig.options || !self.userConfig.options.mail || !self.userConfig.code){
            return null;
        }
        // create reusable transporter object using SMTP transport
        return nodemailer.createTransport(_.merge(wellknown('Gmail'), {
            auth: {
                user: self.userConfig.options.mail, //'bret.maxime@gmail.com',
                pass: self.userConfig.options.code //'mfdcqshtsttdgamr'
            }
        }));
    }
}

module.exports = Module;