'use strict';

var Module = require('./lib/module.js');
var pluginPackage = require('./plugin-package');

function plugin(helper){
    helper.registerCoreModule(pluginPackage.modules[0].name, Module);
}

module.exports = plugin;