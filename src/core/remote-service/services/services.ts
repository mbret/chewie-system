"use strict";
var util = require('util');
var ApiResponseError = require("../response-error");

function ApiHelper() {

}

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

ApiHelper.prototype.createOrUpdatePlugin = function(userId, pluginId, data) {
    var self = this;
    return this.findPlugin(userId, pluginId)
        .then(function(plugin) {
            if(!plugin) {
                return self.createPlugin(userId, data);
            }
            return self.updatePlugin(userId, pluginId, data);
        });
};

ApiHelper.prototype.updatePlugin = function(userId, pluginIdOrName, data) {
    var self = this;
    return self.put(util.format("/users/%s/plugins/%s", userId, pluginIdOrName), data)
        .then(function(response) {
            // We only should get 200 / 400
            if(response.statusCode !== 200) {
                return Promise.reject(ApiResponseError.BuildErrorFromResponse(response));
            }
            return response.body;
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
                return Promise.reject(ApiResponseError.BuildErrorFromResponse(response));
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
ApiHelper.prototype.createUser = function(data) {
    return this.post("/users", data)
        .then(function(response) {
            // We only should get 201 / 400
            if(response.statusCode !== 201) {
                return Promise.reject(ApiResponseError.BuildErrorFromResponse(response));
            }
            return response.body;
        });
};

/**
 *
 * @param data
 * @returns {*}
 */
ApiHelper.prototype.findOrCreateUser = function(data) {
    var self = this;
    return this.findUserByUsername(data.username)
        .then(function(user) {
            if (!user) {
                return self.createUser(data);
            }
            return user;
        });
};

/**
 * Return module or null if it does not exist
 * @param userId
 * @param pluginName
 * @param moduleName
 * @returns {*}
 */
ApiHelper.prototype.findModuleByName = function(userId, pluginId, moduleName) {
    return this.get(util.format("/users/%s/plugins/%s/modules/%s", userId, pluginId, moduleName))
        .then(function(response) {
            if(response.statusCode !== 200) {
                return null;
            }
            return response.body;
        });
};

module.exports = ApiHelper;