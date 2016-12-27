"use strict";

module.exports = class Plugin {

    onLoad(helper, cb) {
        helper.shared.lastRunningRadio = null;
        // this.interval = setInterval(function() {
        //     console.log("coucou", new Date());
        // }, 3000);
        return cb();
    }

    onStop() {
        // clearInterval(this.interval);
    }
};