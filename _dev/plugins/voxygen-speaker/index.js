'use strict';

var myModule = require('./lib/core-module.js');

function plugin(pluginName, helper){
    helper.registerCoreModule(myModule);
}

plugin.require = ['helper'];

module.exports = plugin;