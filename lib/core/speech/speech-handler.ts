'use strict';

var _ = require('lodash');

class SpeechHandler{

    constructor(system){
        this.logger = system.logger.Logger.getLogger('SpeechHandler');

        this.commands = [];
    }

    registerNewCommand(command, cb){
        var found = _.find(this.commands, function(entry){
           return entry.command === command;
        });

        // One command found, push fn to the stack
        if(found !== undefined){
            found.fns.push(cb);
            this.logger.debug('Command [%s] updated with new callback to the stack.', command);
            return;
        }

        this.commands.push({
            command: command,
            fns: [cb]
        });
        this.logger.debug('Command [%s] registered with its first callback.', command);
    }

    /**
     *
     * @param command
     */
    executeCommand(command){

        var tmp = _.find(this.commands, function(tmp){
            return (tmp.command === command);
        });

        if(tmp !== undefined && tmp !== null){
            // Execute all callback
            _.forEach(tmp.fns, function(fn){
                fn();
            });
        }
        else{
            this.logger.warn('Execution of [%s] aborted! No command found.', command);
        }
    }

    getCommands(){
        return this.commands;
    }
}

module.exports = SpeechHandler;