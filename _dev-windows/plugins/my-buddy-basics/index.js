'use strict';

var MessageAdapterConsole = require('./lib/output-adapter-console.js');
var pluginPackage = require('./plugin-package');

function Plugin(helper){
    helper.registerOutputAdapter(pluginPackage.modules[0].name, MessageAdapterConsole);
}

module.exports = Plugin;