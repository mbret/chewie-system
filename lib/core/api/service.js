"use strict";

var request = require("request");
var _ = require("lodash");
var ApiResponseError = require("./response-error").ApiResponseError;
var _helper = require('./_helper');
var util = require("util");

function ApiService(system) {

    var self = this;
    this.system = system;
    this.logger = system.logger.getLogger('ApiService');
    this.defaultRequestOptions = {
        rejectUnauthorized: false,
        baseUrl: null
    };

    this.system.apiServer.on("initialized", function() {
        var address = self.system.apiServer.getRemoteAddress();
        self.logger.debug("Api server detected on address %s", address);
        self.defaultRequestOptions.baseUrl = address;
    });

    this._buildOptions = function(userOptions) {
        // case of we have just an uri
        if(_.isString(userOptions)) {
            userOptions = { uri: userOptions };
        }
        return _.merge(this.defaultRequestOptions, userOptions);
    };

    this._handleResponse = function(cb, error, response, body) {
        // Be careful this will not pass a response but a native Error object.
        // It just does not have body, statusCode, etc
        if (error) {
            return cb(error);
        }

        try {
            response.body = JSON.parse(response.body);
        } catch(err) {}

        if (response.statusCode === 500) {

            // Build an error object that will wrap response
            // So we have a valid Error object and still able to handle response
            return cb(new ApiResponseError(response));
        }

        return cb(null, response);
    };

    /**
     *
     * @param options
     * @returns {Promise}
     */
    this.get = function(options) {
        var self = this;
        options = self._buildOptions(options);
        return new Promise(function(resolve, reject) {
            request
                .get(options, self._handleResponse.bind(null, (function(err, httpResponse) {
                    if(err) {
                        return reject(err);
                    }

                    return resolve(httpResponse);
                })));
        });
    };

    /**
     * 
     * @returns {Promise}
     */
    this.post = function(options, data) {
        var self = this;
        options = self._buildOptions(options);
        return new Promise(function(resolve, reject) {
            request
                .post(_.merge(options, {form: data}), self._handleResponse.bind(null, (function(err, httpResponse) {
                    if(err) {
                        return reject(err);
                    }

                    return resolve(httpResponse);
                })));
        });
    };
}

util.inherits(ApiService, _helper);

module.exports = ApiService;