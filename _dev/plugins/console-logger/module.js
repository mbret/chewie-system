"use strict";

class Module {

    constructor(helper, info) {
        super();
        this.info = info;
        this.helper = helper;
    }

    run(options) {
        console.log(options.content);
    }
}

module.exports = Module;