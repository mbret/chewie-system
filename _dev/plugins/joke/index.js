'use strict';

function myPlugin(moduleName, helper)
{
    helper.registerModule(require('./module'));
}

module.exports = myPlugin;