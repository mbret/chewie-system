'use strict';

var config = require('./config.js');
var Module = require('./module.js');

/**
 *
 * @param moduleName
 * @param daemon
 * @param scheduler
 * @param logger
 * @param PluginHelper helper
 */
function buddyModule(moduleName, helper)
{
    // Register module (using same module package name)
    // Pass the module config
    helper.registerModule(Module);
}

module.exports = buddyModule;