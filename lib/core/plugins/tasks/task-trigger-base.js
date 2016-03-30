'use strict';

var CustomEventEmitter = require(CORE_DIR + '/custom-event-emitter');
var uuid = require('uuid');
var logger = LOGGER.getLogger('TaskTrigger');
var _ = require('lodash');

class TaskTrigger extends CustomEventEmitter{

    /**
     *
     * @param system
     * @param id
     * @param task
     * @param type
     * @param options
     * @param messageAdapters
     */
    constructor(system, task, id, type, options, messageAdapters){
        super();

        if(!options){
            options = {};
        }

        if(!messageAdapters){
            messageAdapters = [];
        }

        this.system = system;

        // This unique id is used to keep reference of current trigger context
        // For example a module may listen for a trigger to make an action and cancel this action
        // if the trigger is thrown again.
        this.id = id || uuid.v4();

        this.task = task;
        this.type = type;
        this.options = options;
        this.messageAdapters = messageAdapters;
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

    getMessageAdapters(){
        return this.messageAdapters;
    }

    initialize(cb){
        return cb();
    }

    execute(){
        this.emit('execute');
    }

    stop(){
        logger.debug('Task trigger [%s] from task [%s] stopped', this.getId(), this.getTask().getId());
    }

    isDirect(){
        return false;
    }

    toJSON(){
        return {
            type: this.type,
            id: this.id,
            options: this.options,
            messageAdapters: this.messageAdapters
        };
    }

    toDb(){
        return _.merge(this.toJSON(), {

        });
    }
}

module.exports = TaskTrigger;