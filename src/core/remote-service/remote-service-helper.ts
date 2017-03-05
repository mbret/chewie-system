"use strict";

import {System} from "../../system";
import {ApiResponseError, ApiResponseNotFoundError, ApiResponseBadRequestError} from "./response-error";

let request = require("request");
let _ = require("lodash");

/**
 *
 * @param system
 * @constructor
 */
class RemoteServiceHelper {

    defaultRequestOptions: any;
    logger: any;
    system: System;

    constructor(system: System) {
        Object.assign(this, {system});

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
        // Be careful this will not pass a response but a native Error object.
        // It just does not have body, statusCode, etc
        if (error) {
            return cb(error);
        }

        response.status = response.statusCode;
        try {
            response.body = JSON.parse(response.body);
        } catch(err) {}
        response.data = response.body

        if (response.statusCode === 500) {

            // Build an error object that will wrap response
            // So we have a valid Error object and still able to handle response
            return cb(new ApiResponseError(response));
        }

        if (response.statusCode === 400) {
            return cb(new ApiResponseBadRequestError(response));
        }

        if (response.statusCode === 404) {

            // Build an error object that will wrap response
            // So we have a valid Error object and still able to handle response
            return cb(new ApiResponseNotFoundError(response));
        }

        return cb(null, response);
    }

    /**
     * @param url
     * @param data
     * @param options
     * @returns {Promise<null>}
     */
    post(url, data = {}, options: any = {}) {
        let self = this;
        options = self._buildOptions(options);
        return new Promise(function(resolve, reject) {
            let opt = _.merge({}, options, {uri: url, body: data, json: true});
            request
                .defaults({headers: { 'content-type': 'application/json'}})
                .post(opt, self._handleResponse.bind(self, (function(err, httpResponse) {
                    if(err) {
                        if (options.failSilently) {
                            return resolve(httpResponse);
                        } else {
                            return reject(err);
                        }
                    }

                    return resolve(httpResponse);
                })));
        });
    }

    put(url, data, options: any = {}) {
        let self = this;
        options = self._buildOptions(options);
        return new Promise(function(resolve, reject) {
            let opt = _.merge({}, options, {uri: url, body: data, json: true});
            request
                .defaults({headers: { 'content-type': 'application/json'}})
                .put(opt, self._handleResponse.bind(self, (function(err, httpResponse) {
                    if(err) {
                        if (options.failSilently) {
                            return resolve(httpResponse);
                        } else {
                            return reject(err);
                        }
                    }

                    return resolve(httpResponse);
                })));
        });
    }

    /**
     *
     * @param url
     * @param options
     * @returns {Promise}
     */
    get(url, options = {}) {
        let self = this;
        options = self._buildOptions(options);
        return new Promise(function(resolve, reject) {
            let opt = _.merge({}, options, {uri: url});
            self.logger.verbose("GET (https) %s%s", self.defaultRequestOptions.baseUrl, url);
            request
                .get(opt, self._handleResponse.bind(self, (function(err, httpResponse) {
                    if(err) {
                        return reject(err);
                    }

                    return resolve(httpResponse);
                })));
        });
    }

    delete(url, options = {}) {
        let self = this;
        options = self._buildOptions(options);
        return new Promise(function(resolve, reject) {
            let opt = _.merge({}, options, {uri: url});
            self.logger.verbose("DELETE (https) %s%s", self.defaultRequestOptions.baseUrl, url);
            request
                .delete(opt, self._handleResponse.bind(self, (function(err, httpResponse) {
                    if(err) {
                        return reject(err);
                    }

                    return resolve(httpResponse);
                })));
        });
    }
}

_.mixin(RemoteServiceHelper.prototype, require('./services/services').prototype);
_.mixin(RemoteServiceHelper.prototype, require('./services/tasks').prototype);

export default RemoteServiceHelper;