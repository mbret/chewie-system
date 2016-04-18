'use strict';

var TaskTriggerBase = require('./task-trigger-base');

class TaskTriggerDirect extends TaskTriggerBase{

    constructor(system, task, id, type, options, outputAdapters){
        super(system, task, id, type, options, outputAdapters);
    }

    initialize(cb){
        var self = this;
        super.initialize(function(err){
            if(err){
                return cb(err);
            }

            setImmediate(self.execute.bind(self));

            return cb();
        });
    }

    isDirect(){
        return true;
    }
}

module.exports = TaskTriggerDirect;