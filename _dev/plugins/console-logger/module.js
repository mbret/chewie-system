"use strict";

class Module {

    constructor(helper, info) {
        this.info = info;
        this.helper = helper;
    }

    run(options) {
        console.log(options.content);
    }
}

module.exports = Module;