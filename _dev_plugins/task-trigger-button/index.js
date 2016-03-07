'use strict';

var myModule = require('./task-trigger.js');

function plugin(pluginName, helper){
    helper.registerTrigger(myModule);
}

plugin.require = ['helper'];

module.exports = plugin;