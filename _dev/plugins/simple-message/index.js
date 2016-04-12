'use strict';

var Module = require('./lib/module.js');
var pluginPackage = require('./plugin-package');

function buddyModule(helper) {
    helper.registerModule(pluginPackage.modules[0].name, Module);
}

module.exports = buddyModule;