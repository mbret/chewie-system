'use strict';

function plugin(helper, cb) {
    helper.shared.lastRunningRadio = null;
    return cb();
}

module.exports = plugin;