'use strict';

var _           = require('lodash');
var nodemailer  = require('nodemailer');
var wellknown   = require('nodemailer-wellknown');
var config      = require('./config.js').adapter;

class Module{

    /**
     *
     * @param helper
     */
    constructor(helper){
        var self = this;
        this.helper = helper;
        this.logger = helper.getLogger();
        this.config = config;
        this.userOptions = helper.getUserOptions();
        this.transporter = null;

        // Tell user options are not set yet.
        if(!this._checkUserOptions(this.userOptions)){
            this._notifyInvalidOptions();
        }
        else{
            this.transporter = this._createTransporter();
        }
    }

    initialize(cb)
    {
        var self = this;

        // Listen for user option change
        this.helper.onUserOptionsChange(function(options){
            self.userOptions = options;

            // update transporter
            if(self._checkUserOptions(self.userOptions)){
                self.transporter = self._createTransporter();
            }
        });

        this.helper.onNewMessage(function(message){

            if(self.transporter === null){
                self._notifyInvalidOptions();
                return;
            }

            var mailOptions = {
                from: 'My buddy',
                to: self.userOptions.mailTo,
                subject: 'Nouveau message !',
                html: '<b>' + message + '</b>'
            };

            console.log(mailOptions);

            self.transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    self.helper.notify('error', error);
                    return;
                }
                self.helper.notify('info', 'Mail sent to ' + mailOptions.to);
            });
        });

        return cb();
    }

    getConfig(){
        return this.config;
    }

    _createTransporter(){
        var self = this;

        // create reusable transporter object using SMTP transport
        return nodemailer.createTransport(_.merge(wellknown('Gmail'), {
            auth: {
                user: self.userOptions.mail, //'bret.maxime@gmail.com',
                pass: self.userOptions.code //'mfdcqshtsttdgamr'
            }
        }));
    }

    _checkUserOptions(options){
        if(!options || !options.mail || !options.code || !options.mailTo){
            return false;
        }
        return true;
    }

    _notifyInvalidOptions(){
        this.helper.notify('warn', 'You have not set required options yet, please configure the module in order to use it');
    }
}

module.exports = Module;