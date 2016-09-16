"use strict";
var util = require('util');
var ApiResponseError = require("../response-error");

function ApiHelper() {}

ApiHelper.prototype = {

    /**
     * @param userId
     * @param pluginId
     * @param moduleName
     * @param data
     * @returns {*}
     */
    createTask: function(userId, pluginId, moduleName, data) {
        data = data || {};
        return this.post(util.format("/users/%s/plugins/%s/modules/%s/tasks", userId, pluginId, moduleName), data)
            .then(function(response) {
                // We only should get 201 / 400
                if(response.statusCode !== 201) {
                    return Promise.reject(ApiResponseError.BuildErrorFromResponse(response));
                }
                return response.body;
            });
    },

    /**
     *
     * @param userId
     * @param pluginId
     * @param moduleName
     * @param data
     */
    findOrCreateTask: function(userId, pluginId, moduleName, data) {
        var self = this;
        if ((data.name + "") === "") {
            return Promise.reject(new Error("Invalid parameters, name required."));
        }
        return this.get(util.format("/users/%s/plugins/%s/modules/%s/tasks/%s", userId, pluginId, moduleName, data.name))
            .then(function(response) {
                if (response.statusCode === 404) {
                    return self.createTask(userId, pluginId, moduleName, data);
                }
                return response.body;
            });
    },

    /**
     *
     * @param userId
     * @param pluginId
     * @param moduleId
     * @param data
     * @returns {*}
     */
    updateOrCreateTask: function(userId, pluginId, moduleId, data) {
        var self = this;
        return this.put(util.format("/users/%s/plugins/%s/modules/%s/tasks/%s", userId, pluginId, moduleId, data))
            .then(function(response) {
                if (response.statusCode === 404) {
                    return self.createTask(userId, pluginId, moduleId, data);
                }
                return response.body;
            })
    }
};

module.exports = ApiHelper;