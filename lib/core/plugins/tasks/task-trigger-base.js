'use strict';

class TaskTrigger{

    constructor(task, type, options){

        if(!options){
            options = {};
        }

        this.task = task;
        this.type = type;
        this.options = options;
    }

    initialize(){

    }
}

module.exports = TaskTrigger;