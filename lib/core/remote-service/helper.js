"use strict";
let request = require("request");
let _ = require("lodash");
let ApiResponseError = require("./response-error").ApiResponseError;
class RemoteServiceHelper {
    constructor(system) {
        Object.assign(this, { system });
        let self = this;
        this.logger = system.logger.getLogger('ApiService');
        this.defaultRequestOptions = {
            rejectUnauthorized: false,
            baseUrl: null
        };
        var address = system.config.sharedApiUrl;
        this.logger.debug("Api server configured on address %s", address);
        this.defaultRequestOptions.baseUrl = address;
        this._buildOptions = function (userOptions) {
            if (_.isString(userOptions)) {
                userOptions = { uri: userOptions };
            }
            return _.merge({}, this.defaultRequestOptions, userOptions);
        };
        this._handleResponse = function (cb, error, response, body) {
            if (error) {
                return cb(error);
            }
            try {
                response.body = JSON.parse(response.body);
            }
            catch (err) { }
            if (response.statusCode === 500) {
                return cb(new ApiResponseError(response));
            }
            return cb(null, response);
        };
        this.get = function (options) {
            var self = this;
            options = self._buildOptions(options);
            return new Promise(function (resolve, reject) {
                request
                    .get(options, self._handleResponse.bind(null, (function (err, httpResponse) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(httpResponse);
                })));
            });
        };
        this.post = function (options, data) {
            var self = this;
            options = self._buildOptions(options);
            return new Promise(function (resolve, reject) {
                let opt = _.merge({}, options, { body: data, json: true });
                request
                    .defaults({ headers: { 'content-type': 'application/json' } })
                    .post(opt, self._handleResponse.bind(null, (function (err, httpResponse) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(httpResponse);
                })));
            });
        };
        this.put = function (options, data) {
            var self = this;
            options = self._buildOptions(options);
            return new Promise(function (resolve, reject) {
                request
                    .put(_.merge(options, { form: data }), self._handleResponse.bind(null, (function (err, httpResponse) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(httpResponse);
                })));
            });
        };
    }
}
_.mixin(RemoteServiceHelper.prototype, require('./services/services').prototype);
_.mixin(RemoteServiceHelper.prototype, require('./services/tasks').prototype);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RemoteServiceHelper;
