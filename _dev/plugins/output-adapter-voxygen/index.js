'use strict';

var myModule = require('./lib/adapter.js');
var pluginPackage = require('./plugin-package');

function plugin(helper){
    helper.registerOutputAdapter(pluginPackage.modules[0].name, myModule);
}

module.exports = plugin;