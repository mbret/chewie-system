"use strict";
var response_error_1 = require("./response-error");
var request = require("request");
var _ = require("lodash");
/**
 *
 * @param system
 * @constructor
 */
var RemoteServiceHelper = (function () {
    function RemoteServiceHelper(system) {
        Object.assign(this, { system: system });
        var self = this;
        this.system = system;
        this.logger = system.logger.getLogger('RemoteServiceHelper');
        this.defaultRequestOptions = {
            rejectUnauthorized: false,
            baseUrl: null
        };
        var address = system.config.sharedApiUrl;
        this.logger.debug("Api server configured on address %s", address);
        this.defaultRequestOptions.baseUrl = address;
    }
    RemoteServiceHelper.prototype._buildOptions = function (userOptions) {
        // case of we have just an uri
        // if(_.isString(userOptions)) {
        //     userOptions = { uri: userOptions };
        // }
        return _.merge({}, this.defaultRequestOptions, userOptions);
    };
    RemoteServiceHelper.prototype._handleResponse = function (cb, error, response, body) {
        // Be careful this will not pass a response but a native Error object.
        // It just does not have body, statusCode, etc
        if (error) {
            return cb(error);
        }
        try {
            response.body = JSON.parse(response.body);
        }
        catch (err) { }
        if (response.statusCode === 500) {
            // Build an error object that will wrap response
            // So we have a valid Error object and still able to handle response
            return cb(new response_error_1.ApiResponseError(response));
        }
        if (response.statusCode === 404) {
            // Build an error object that will wrap response
            // So we have a valid Error object and still able to handle response
            return cb(new response_error_1.ApiResponseNotFoundError(response));
        }
        return cb(null, response);
    };
    /**
     * @param url
     * @param data
     * @param options
     * @returns {Promise<null>}
     */
    RemoteServiceHelper.prototype.post = function (url, data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        var self = this;
        options = self._buildOptions(options);
        return new Promise(function (resolve, reject) {
            var opt = _.merge({}, options, { uri: url, body: data, json: true });
            request
                .defaults({ headers: { 'content-type': 'application/json' } })
                .post(opt, self._handleResponse.bind(self, (function (err, httpResponse) {
                if (err) {
                    if (options.failSilently) {
                        return resolve(httpResponse);
                    }
                    else {
                        return reject(err);
                    }
                }
                return resolve(httpResponse);
            })));
        });
    };
    RemoteServiceHelper.prototype.put = function (url, data, options) {
        var self = this;
        options = self._buildOptions(options);
        return new Promise(function (resolve, reject) {
            var opt = _.merge({}, options, { uri: url, body: data, json: true });
            request
                .put(_.merge(options, { form: data }), self._handleResponse.bind(self, (function (err, httpResponse) {
                if (err) {
                    return reject(err);
                }
                return resolve(httpResponse);
            })));
        });
    };
    /**
     *
     * @param url
     * @param options
     * @returns {Promise}
     */
    RemoteServiceHelper.prototype.get = function (url, options) {
        if (options === void 0) { options = {}; }
        var self = this;
        options = self._buildOptions(options);
        return new Promise(function (resolve, reject) {
            var opt = _.merge({}, options, { uri: url });
            self.logger.verbose("GET (https) %s%s", self.defaultRequestOptions.baseUrl, url);
            request
                .get(opt, self._handleResponse.bind(self, (function (err, httpResponse) {
                if (err) {
                    return reject(err);
                }
                return resolve(httpResponse);
            })));
        });
    };
    return RemoteServiceHelper;
}());
_.mixin(RemoteServiceHelper.prototype, require('./services/services').prototype);
_.mixin(RemoteServiceHelper.prototype, require('./services/tasks').prototype);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RemoteServiceHelper;
