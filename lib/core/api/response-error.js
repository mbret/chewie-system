"use strict";

var _ = require("lodash");

class ApiResponseError extends Error {
    constructor(response) {
        super();

        // Handle some error that are not well formed
        // ex: request not even sent "cannot POST ..." or bad response from api
        if(_.isString(response.body)) {
            response.body = {
                message: response.body,
                data: {}
            };
        }

        this.name = "ApiResponseError";
        this.message = "Http 500 Internal Server error: " + response.body.message;
        this.response = response;
        if(response.body.data.stack) {
            this.message += "\nResponse stack:\n" + response.body.data.stack + "\nEnd of response stack\n";
        }
    }
}

class ApiResponseBadRequestError extends ApiResponseError {
    constructor(response) {
        super(response);

        this.name = "ApiResponseBadRequestError";
        this.message = "Http 400 Bad request: " + (response.body.message || "No message!");
    }
}

class ApiResponseNotFoundError extends ApiResponseError {
    constructor(response) {
        super(response);

        this.name = "ApiResponseNotFoundError";
        this.message = "Http 404 Not found: " + response.body.message;
    }
}

module.exports = {
    ApiResponseError: ApiResponseError,
    ApiResponseBadRequestError: ApiResponseBadRequestError,
    ApiResponseNotFoundError: ApiResponseNotFoundError,
    BuildErrorFromResponse: function(response) {
        switch(response.statusCode) {
            case 400:
                return new ApiResponseBadRequestError(response);
            case 404:
                return new ApiResponseNotFoundError(response);
            default:
                return new ApiResponseError(response);
        }
    }
};