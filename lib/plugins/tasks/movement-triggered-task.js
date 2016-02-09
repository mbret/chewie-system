'use strict';

var Task = require('./task.js');
var _ = require('lodash');

class MovementTriggeredTask extends Task{

    constructor(id, module, messageAdapters, optionsOnEnter, optionsOnExit){
        super(id, module, messageAdapters, {});

        if(!optionsOnEnter){
            optionsOnEnter = {};
        }

        if(!optionsOnExit){
            optionsOnExit = {};
        }

        this.optionsOnEnter = optionsOnEnter;
        this.optionsOnExit = optionsOnExit;
    }

    toDb(){
        var tmp = super.toDb();
        return _.merge(tmp, {
            optionsOnEnter : this.optionsOnEnter,
            optionsOnExit : this.optionsOnExit
        });
    }
}

module.exports = MovementTriggeredTask;