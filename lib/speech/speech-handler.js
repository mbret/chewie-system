'use strict';

var _ = require('lodash');
var logger = LOGGER.getLogger('SpeechHandler');

class SpeechHandler{

    constructor(){
        this.commands = [];
    }

    registerNewCommand(command, cb){
        this.commands.push({
            command: command,
            fn: cb
        });
    }

    executeCommand(command){

        console.log(this.commands);
        var tmp = _.find(this.commands, function(tmp){
            console.log(tmp, command);
            return (tmp.command === command);
        });

        if(tmp !== undefined && tmp !== null){
            tmp.fn();
        }
        else{
            logger.warn('No command found for %s', command);
        }
    }

    getCommands(){
        return this.commands;
    }
}

module.exports = SpeechHandler;