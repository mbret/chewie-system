'use strict';

var config = require('./config.js');
var Module = require('./module.js');

function buddyModule(moduleName, daemon, scheduler, logger, helper)
{
    helper.setConfig(config.plugin);

    // Register module (using same module package name)
    // Pass the module config
    helper.registerModule(Module);//, module.getConfig());
}

buddyModule.require = ['daemon', 'scheduler', 'logger', 'helper'];

module.exports = buddyModule;