"use strict";

class Module {

    constructor(helper){
        this.helper = helper;
    }

    initialize(cb){
        var self = this;

        return cb();
    }

    destroy(cb) {
        return cb();
    }

    onDemand(options, cb) {
        setInterval(function() {
            return cb();
        }, 5000);
    }
}

module.exports = Module;