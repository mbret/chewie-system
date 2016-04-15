'use strict';

var _ = require('lodash');
var Player  = require('./player.js');

class Adapter{

    constructor(helper) {
        this.helper = helper;
        this.sound  = null;
        this.config = {
            // By default the player will look for mpg123 as PATH executable
            // You can force the use of specific location
            //binaryPath: null,
            binaryPath: 'C:/Program Files/mpg123/mpg123',
        };
    }

    init(cb){
        var self = this;
        Player.Create(this.helper, this.config, function(err, instance){
            if(err){
                return cb(err);
            }
            self.sound = instance;
            return cb();
        });
    }

    playFile(filename){
        var self = this;
        var sound = self.sound.playFile(filename);
        return sound;
    }
}

module.exports = Adapter;