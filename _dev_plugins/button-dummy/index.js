'use strict';

var myModule = require('./lib/task-command-key.js');

function plugin(pluginName, helper){
    helper.registerTaskTrigger(myModule);
}

plugin.require = ['helper'];

module.exports = plugin;