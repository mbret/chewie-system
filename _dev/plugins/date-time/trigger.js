"use strict";

class Trigger {

    constructor() {
        this.info = null;
    }

    initialize(info, cb) {
        this.info = info;
        return cb();
    }

    onNewDemand(options, cb) {
        this._watchSchedule(options, cb);
    }

    _watchSchedule(options, cb) {

    }
}

module.exports = Trigger;