'use strict';

var Module = require('./lib/module.js');

function buddyModule(helper)
{
    // Register module (using same module package name)
    // Pass the module config
    helper.registerModule(Module);
}

module.exports = buddyModule;