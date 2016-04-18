'use strict';

var Adapter = require('./adapter.js');
var config = require('./config.js').plugin;

function MyModule(moduleName, daemon, scheduler, logger, helper)
{
    //helper.setConfig(config);
    helper.registerOutputAdapter(Adapter);
}

MyModule.require = ['daemon', 'scheduler', 'logger', 'helper'];

module.exports = MyModule;