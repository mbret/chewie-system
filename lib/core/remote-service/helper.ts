"use strict";
import {System} from "../../system";

let request = require("request");
let _ = require("lodash");
let ApiResponseError = require("./response-error").ApiResponseError;

/**
 *
 * @param system
 * @constructor
 */
class RemoteServiceHelper {

    defaultRequestOptions: any;
    logger: any;

    constructor(system: System) {
        Object.assign(this, {system});

        let self = this;
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
        // case of we have just an uri
        // if(_.isString(userOptions)) {
        //     userOptions = { uri: userOptions };
        // }
        return _.merge({}, this.defaultRequestOptions, userOptions);
    }

    _handleResponse(cb, error, response, body) {
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
    }

    /**
     *
     * @returns {Promise}
     */
    post(url, data = {}, options = {}) {
        let self = this;
        options = self._buildOptions(options);
        return new Promise(function(resolve, reject) {
            let opt = _.merge({}, options, {uri: url, body: data, json: true});
            request
                .defaults({headers: { 'content-type': 'application/json'}})
                .post(opt, self._handleResponse.bind(null, (function(err, httpResponse) {
                    if(err) {
                        return reject(err);
                    }

                    return resolve(httpResponse);
                })));
        });
    }

    put(url, data, options) {
        let self = this;
        options = self._buildOptions(options);
        return new Promise(function(resolve, reject) {
            let opt = _.merge({}, options, {uri: url, body: data, json: true});
            request
                .put(_.merge(options, {form: data}), self._handleResponse.bind(null, (function(err, httpResponse) {
                    if(err) {
                        return reject(err);
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
    get(url, options) {
        let self = this;
        options = self._buildOptions(options);
        return new Promise(function(resolve, reject) {
            let opt = _.merge({}, options, {uri: url});
            self.logger.verbose("GET (https) %s%s", self.defaultRequestOptions.baseUrl, url);
            request
                .get(opt, self._handleResponse.bind(null, (function(err, httpResponse) {
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