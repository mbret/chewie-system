"use strict";
var util = require('util');

function ApiHelper() {

}

/**
 * Return module or null if it does not exist
 * @param userId
 * @param pluginName
 * @param moduleName
 * @returns {*}
 */
ApiHelper.prototype.getModule = function(userId, pluginName, moduleName) {
    return this.get(util.format("/users/%s/plugins/%s/modules/%s", userId, pluginName, moduleName))
        .then(function(response) {
            if(response.statusCode !== 200) {
                return null;
            }
            return response.body;
        });
};

module.exports = ApiHelper;