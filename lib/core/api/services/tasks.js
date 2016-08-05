"use strict";
var util = require('util');
var ApiResponseError = require("../response-error");

function ApiHelper() {}

ApiHelper.prototype = {

    /**
     *
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

    }
};

module.exports = ApiHelper;