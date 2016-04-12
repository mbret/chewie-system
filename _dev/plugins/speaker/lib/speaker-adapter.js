'use strict';

var _ = require('lodash');
var Player  = require('./player.js');
var config = require('../config.js');
config = config.speakerAdapter;

class Adapter{

    constructor(helper) {
        this.helper = helper;
        this.config = config;
        this.sound  = null;
    }

    init(cb){
        var self = this;
        Player.create(this.helper, this.config, function(err, instance){
            if(err){
                return cb(err);
            }
            self.sound = instance;
            return cb();
        });
    }

    playFile(filename){
        var self = this;
        self.sound.playFile(filename, function(err){
            if(err){
                self.helper.getLogger().error(err);
                throw err;
            }
        });
    }
}

module.exports = Adapter;