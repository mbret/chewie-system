'use strict';

var Module = require('./module.js');

function MyModule(moduleName, daemon, scheduler, logger, helper)
{
    helper.registerMessageAdapter(Module);
}

MyModule.require = ['daemon', 'scheduler', 'logger', 'helper'];

module.exports = MyModule;