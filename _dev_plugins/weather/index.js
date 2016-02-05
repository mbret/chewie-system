'use strict';

var myModule = require('./lib/module.js');

function plugin(pluginName, helper){
    helper.registerModule(myModule);
}

plugin.require = ['helper'];

module.exports = plugin;