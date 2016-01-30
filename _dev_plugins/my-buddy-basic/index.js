'use strict';

var MessageAdapterSpeak = require('./lib/message-adapter-speak.js');
var MessageAdapterConsole = require('./lib/message-adapter-console.js');

function Plugin(pluginName, helper){
    helper.registerMessageAdapter('MessageAdapterSpeak', MessageAdapterSpeak);
    helper.registerMessageAdapter('MessageAdapterConsole', MessageAdapterConsole);
}

Plugin.require = ['helper'];

module.exports = Plugin;