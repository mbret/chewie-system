'use strict';

var myModule = require('./trigger.js');

function plugin(pluginName, helper){
    helper.registerTaskTrigger(myModule);
}

plugin.require = ['helper'];

module.exports = plugin;