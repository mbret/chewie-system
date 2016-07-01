"use strict";

var request = require("request");
var _ = require("lodash");
var ApiResponseError = require("./response-error");

class ApiService {

    constructor(system) {
        var self = this;
        this.system = system;
        this.logger = system.logger.getLogger('ApiService');
        this.defaultRequestOptions = {
            rejectUnauthorized: false,
            baseUrl: null
        };

        this.system.apiServer.on("initialized", function() {
            var address = this.system.apiServer.getRemoteAddress();
            self.logger.debug("Api server detected on address %s", address);
            self.defaultRequestOptions.baseUrl = address;
        });
    }

    _buildOptions(userOptions) {
        // case of we have just an uri
        if(_.isString(userOptions)) {
            userOptions = { uri: userOptions };
        }
        return _.merge(this.defaultRequestOptions, userOptions);
    }

    _handleResponse(cb, error, response, body) {
        // Be carefull this will not pass a response but a native Error object.
        // It just does not have body, statusCode, etc
        if (error) {
            return cb(error);
        }

        response.body = JSON.parse(response.body);

        if (response.statusCode === 500) {

            // Build an error object that will wrap response
            // So we have a valid Error object and still able to handle response
            return cb(new ApiResponseError(response));
        }

        return cb(null, response);
    }

    get(options) {
        new Promise(function(resolve, reject) {
            request
                .get(options, function(error, response, body) {
                    if (error) {
                        return reject(error);
                    }
                    // statusCode
                    // statusMessage
                    // body

                    return resolve(response);
                });
        });
    }

    /**
     * 
     * @returns {Promise}
     */
    post(options, data) {
        var self = this;
        options = self._buildOptions(options);
        this.logger.debug("Request [post] to %s", this.defaultRequestOptions.baseUrl + options.uri);
        return new Promise(function(resolve, reject) {
            request
                .post(_.merge(options, {form: data}), self._handleResponse.bind(null, (function(err, httpResponse) {
                    if(err) {
                        return reject(err);
                    }

                    return resolve(httpResponse);
                })));
        });
    }
}

module.exports = ApiService;