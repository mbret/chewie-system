'use strict';

var CoreModule = require('./lib/core-module.js');

function MyModule(moduleName, helper)
{
    //helper.registerCoreModule(CoreModule);
}

MyModule.require = ['helper'];

module.exports = MyModule;