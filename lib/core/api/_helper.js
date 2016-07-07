"use strict";
var util = require('util');
var ApiResponseError = require("./response-error");

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

/**
 *
 * @param username
 * @returns {*}
 */
ApiHelper.prototype.findUserByUsername = function(username) {
    return this.get(util.format("/users/%s", username))
        .then(function(response) {
            if(response.statusCode !== 200) {
                return null;
            }
            return response.body;
        });
};

/**
 *
 * @param userId
 * @returns {*}
 */
ApiHelper.prototype.findAllPluginsByUser = function(userId) {
    return this.get(util.format("/users/%s/plugins", userId))
        .then(function(response) {
            if(response.statusCode !== 200) {
                return null;
            }
            return response.body;
        });
};

/**
 *
 * @param userId
 * @param pluginId
 * @returns {*}
 */
ApiHelper.prototype.findPlugin = function(userId, pluginIdOrName) {
    return this.get(util.format("/users/%s/plugins/%s", userId, pluginIdOrName))
        .then(function(response) {
            if(response.statusCode !== 200) {
                return null;
            }
            return response.body;
        });
};

/**
 *
 * @param userId
 * @returns {*}
 */
ApiHelper.prototype.findAllTasksByUser = function(userId) {
    return this.get(util.format("/users/%s/tasks", userId))
        .then(function(response) {
            if(response.statusCode !== 200) {
                return null;
            }
            return response.body;
        });
};

/**
 *
 * @returns {*}
 */
ApiHelper.prototype.findOrCreatePlugin = function(userId, pluginIdOrName, data) {
    var self = this;
    return this.findPlugin(userId, pluginIdOrName)
        .then(function(plugin) {
             if(!plugin) {
                 return self.createPlugin(userId, data);
             }
            return plugin;
        });
};

/**
 *
 * @param userId
 * @param data
 * @returns {*}
 */
ApiHelper.prototype.createPlugin = function(userId, data) {
    data.userId = userId;
    return this.post(util.format("/users/%s/plugins", userId), data)
        .then(function(response) {
            // We only should get 201 / 400
            if(response.statusCode !== 201) {
                return Promise.reject(response.body);
            }
            return response.body;
        });
};

/**
 *
 * @param userId
 * @param pluginId
 * @param moduleName
 * @param data
 * @returns {*}
 */
ApiHelper.prototype.createTask = function(userId, pluginId, moduleName, data) {
    return this.post(util.format("/users/%s/plugins/%s/modules/%s/tasks", userId, pluginId, moduleName), data)
        .then(function(response) {
            // We only should get 201 / 400
            if(response.statusCode !== 201) {
                return Promise.reject(ApiResponseError.BuildErrorFromResponse(response));
            }
            return response.body;
        });
};

module.exports = ApiHelper;