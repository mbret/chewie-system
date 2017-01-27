"use strict";
const response_error_1 = require("./response-error");
let request = require("request");
let _ = require("lodash");
class RemoteServiceHelper {
    constructor(system) {
        Object.assign(this, { system });
        let self = this;
        this.system = system;
        this.logger = system.logger.getLogger('RemoteServiceHelper');
        this.defaultRequestOptions = {
            rejectUnauthorized: false,
            baseUrl: null
        };
        let address = system.config.sharedApiUrl;
        this.logger.debug("Api server configured on address %s", address);
        this.defaultRequestOptions.baseUrl = address;
    }
    _buildOptions(userOptions) {
        return _.merge({}, this.defaultRequestOptions, userOptions);
    }
    _handleResponse(cb, error, response, body) {
        if (error) {
            return cb(error);
        }
        try {
            response.body = JSON.parse(response.body);
        }
        catch (err) { }
        if (response.statusCode === 500) {
            return cb(new response_error_1.ApiResponseError(response));
        }
        if (response.statusCode === 404) {
            return cb(new response_error_1.ApiResponseNotFoundError(response));
        }
        return cb(null, response);
    }
    post(url, data = {}, options = {}) {
        let self = this;
        options = self._buildOptions(options);
        return new Promise(function (resolve, reject) {
            let opt = _.merge({}, options, { uri: url, body: data, json: true });
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
    }
    put(url, data, options) {
        let self = this;
        options = self._buildOptions(options);
        return new Promise(function (resolve, reject) {
            let opt = _.merge({}, options, { uri: url, body: data, json: true });
            request
                .put(_.merge(options, { form: data }), self._handleResponse.bind(self, (function (err, httpResponse) {
                if (err) {
                    return reject(err);
                }
                return resolve(httpResponse);
            })));
        });
    }
    get(url, options = {}) {
        let self = this;
        options = self._buildOptions(options);
        return new Promise(function (resolve, reject) {
            let opt = _.merge({}, options, { uri: url });
            self.logger.verbose("GET (https) %s%s", self.defaultRequestOptions.baseUrl, url);
            request
                .get(opt, self._handleResponse.bind(self, (function (err, httpResponse) {
                if (err) {
                    return reject(err);
                }
                return resolve(httpResponse);
            })));
        });
    }
}
_.mixin(RemoteServiceHelper.prototype, require('./services/services').prototype);
_.mixin(RemoteServiceHelper.prototype, require('./services/tasks').prototype);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RemoteServiceHelper;
//# sourceMappingURL=remote-service-helper.js.map