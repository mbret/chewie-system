'use strict';

var CoreModule = require('./lib/core-module.js');
var taskTrigger = require('./lib/task-trigger-voice.js');

function MyModule(moduleName, helper)
{
    //helper.registerCoreModule(CoreModule);
    helper.registerTaskTrigger('voice', taskTrigger);
}

MyModule.require = ['helper'];

module.exports = MyModule;