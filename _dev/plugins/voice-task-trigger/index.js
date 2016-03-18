'use strict';

var CoreModule = require('./lib/core-module.js');
var taskTrigger = require('./lib/task-trigger-voice.js');

function MyModule(moduleName, helper)
{
    helper.registerTrigger(taskTrigger);
}

MyModule.require = ['helper'];

module.exports = MyModule;