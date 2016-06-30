"use strict";

var request = require("request");
var _ = require("lodash");

class ApiService {

    constructor(system) {
        var self = this;
        this.system = system;
        this.logger = system.logger.getLogger('ApiService');
        this.baseUrl = null;
        this.defaultRequestOptions = {
            rejectUnauthorized: false,
            baseUrl: null
        };

        this.system.apiServer.on("initialized", function() {
            var address = this.system.apiServer.getRemoteAddress();
            self.logger.debug("Api server detected on address %s", address);
            self.baseUrl = address;
            self.defaultRequestOptions.baseUrl = self.baseUrl;
        });
    }

    _buildOptions(userOptions) {
        return _.merge(this.defaultRequestOptions, userOptions);
    }

    _handleResponse(cb, error, response, body) {
        if (error) {
            return cb(error);
        }

        if (response.statusCode === 500) {
            return cb(new Error(response.body));
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
     * @param endpoint
     * @param options
     * @returns {Promise}
     */
    post(endpoint, options) {
        var self = this;
        this.logger.debug("Request [post] to %s", self.baseUrl + endpoint);
        return new Promise(function(resolve, reject) {
            request
                .post(_.merge({uri: endpoint}, self._buildOptions(options)), self._handleResponse.bind(null, (function(err, response) {
                    if(err) {
                        return reject(err);
                    }

                    return resolve(response);
                })));
        });
    }
}

module.exports = ApiService;