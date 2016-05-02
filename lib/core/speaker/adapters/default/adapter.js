'use strict';

var _ = require('lodash');
var Player  = require('./player.js');

class Adapter {

    constructor(system) {
        this.logger = system.logger.Logger.getLogger('Speaker Adapter');

        this.system = system;
        this.sound  = null;
        
        this.config = {
            // By default the player will look for mpg123 as PATH executable
            // You can force the use of specific location
            binaryPath: system.getConfig().system.mpg123BinaryPath,
        };

        // keep reference of all active sounds
        this.sounds = [];
    }

    initialize(cb){
        var self = this;

        Player.Create(this.system, this.logger, this.config, function(err, instance){
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
        this.sounds.push(sound);

        sound.on('closed', function(){
            let index = self.sounds.indexOf(sound);
            self.sounds.splice(index, 1);
        });

        return sound;
    }

    kill(){
        this.sounds.forEach(function(sound){
            sound.close();
        });
    }
}

module.exports = Adapter;