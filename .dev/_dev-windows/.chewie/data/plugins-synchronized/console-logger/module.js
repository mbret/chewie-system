"use strict";

class Module {

    constructor(helper, info) {
        this.info = info;
        this.helper = helper;
    }

    run(options, done) {
        console.log(options.content);
        return done();
    }
}

module.exports = Module;