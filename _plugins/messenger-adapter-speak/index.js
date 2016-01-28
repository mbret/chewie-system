'use strict';

var Adapter = require('./lib/adapter.js');

function Plugin(pluginName, helper){
    helper.registerMessageAdapter(Adapter);
}

Plugin.require = ['helper'];

module.exports = Plugin;