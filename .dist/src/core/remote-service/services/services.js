"use strict";
var util = require('util');
var ApiResponseError = require("../response-error");
function ApiHelper() { }
ApiHelper.prototype.findUserByUsername = function (username) {
    return this.get(util.format("/users/%s", username))
        .then(function (response) {
        if (response.statusCode !== 200) {
            return null;
        }
        return response.body;
    });
};
ApiHelper.prototype.findAllTasksByUser = function (userId) {
    return this.get(util.format("/users/%s/tasks", userId))
        .then(function (response) {
        if (response.statusCode !== 200) {
            return null;
        }
        return response.body;
    });
};
ApiHelper.prototype.findOrCreatePlugin = function (userId, pluginIdOrName, data) {
    var self = this;
    return this.findPlugin(userId, pluginIdOrName)
        .then(function (plugin) {
        if (!plugin) {
            return self.createPlugin(userId, data);
        }
        return plugin;
    });
};
ApiHelper.prototype.createOrUpdatePlugin = function (userId, pluginId, data) {
    var self = this;
    return this.findPlugin(userId, pluginId)
        .then(function (plugin) {
        if (!plugin) {
            return self.createPlugin(userId, data);
        }
        return self.updatePlugin(userId, pluginId, data);
    });
};
ApiHelper.prototype.updatePlugin = function (userId, pluginIdOrName, data) {
    var self = this;
    return self.put(util.format("/users/%s/plugins/%s", userId, pluginIdOrName), data)
        .then(function (response) {
        if (response.statusCode !== 200) {
            return Promise.reject(ApiResponseError.BuildErrorFromResponse(response));
        }
        return response.body;
    });
};
ApiHelper.prototype.createPlugin = function (userId, data) {
    data.userId = userId;
    return this.post(util.format("/users/%s/plugins", userId), data)
        .then(function (response) {
        if (response.statusCode !== 201) {
            return Promise.reject(ApiResponseError.BuildErrorFromResponse(response));
        }
        return response.body;
    });
};
ApiHelper.prototype.createUser = function (data) {
    return this.post("/users", data)
        .then(function (response) {
        if (response.statusCode !== 201) {
            return Promise.reject(ApiResponseError.BuildErrorFromResponse(response));
        }
        return response.body;
    });
};
ApiHelper.prototype.findOrCreateUser = function (data) {
    var self = this;
    return this.findUserByUsername(data.username)
        .then(function (user) {
        if (!user) {
            return self.createUser(data);
        }
        return user;
    });
};
ApiHelper.prototype.findModuleByName = function (userId, pluginId, moduleName) {
    return this.get(util.format("/users/%s/plugins/%s/modules/%s", userId, pluginId, moduleName))
        .then(function (response) {
        if (response.statusCode !== 200) {
            return null;
        }
        return response.body;
    });
};
module.exports = ApiHelper;
//# sourceMappingURL=services.js.map