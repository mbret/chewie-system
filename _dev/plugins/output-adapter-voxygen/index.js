'use strict';

var myModule = require('./lib/core-module.js');

function plugin(pluginName, helper){
    helper.registerCoreModule(myModule);
}

module.exports = plugin;