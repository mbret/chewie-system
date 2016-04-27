'use strict';

var CustomEventEmitter = require(CORE_DIR + '/custom-event-emitter');
var uuid = require('uuid');
var _ = require('lodash');

class TaskTrigger extends CustomEventEmitter{

    constructor(system, task, id, type, options, outputAdapters){
        super();

        this.logger = system.logger.Logger.getLogger('TaskTrigger');

        if(!options){
            options = {};
        }

        this.system = system;

        // This unique id is used to keep reference of current trigger context
        // For example a module may listen for a trigger to make an action and cancel this action
        // if the trigger is thrown again.
        this.id = id || uuid.v4();

        this.task = task;
        this.type = type;
        this.options = options;
        this.outputAdapters = outputAdapters || [];
        this.running = true;
    }

    getTask(){
        return this.task;
    }

    getType(){
        return this.type;
    }

    getOptions(){
        return this.options;
    }

    getId(){
        return this.id;
    }

    getOutputAdapters(){
        return this.outputAdapters;
    }

    initialize(cb){
        return cb();
    }

    execute(){
        this.emit('execute');
    }

    stop(){
        this.logger.debug('Task trigger [%s] from task [%s] stopped', this.getId(), this.getTask().getId());
    }

    isDirect(){
        return false;
    }

    toJSON(){
        return {
            type: this.type,
            id: this.id,
            // schedule
            nextInvocation: null,
            running: this.running,
            //options: this.options,
            //outputAdapters: this.outputAdapters
        };
    }
}

module.exports = TaskTrigger;