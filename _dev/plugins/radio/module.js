'use strict';

class Module {

    constructor(helper){
        this.helper = helper;
    }

    initialize(cb){
        return cb();
    }

    destroy(cb) {
        return cb();
    }

    newTask(task) {
        task.on('execute', function(context){

        });

        task.on('stopped', function(){

        });
    }
}

module.exports = Module;