"use strict";
let _ = require("lodash");
class ApiResponseError extends Error {
    constructor(response) {
        super();
        if (_.isString(response.body)) {
            response.body = {
                message: response.body,
                data: {}
            };
        }
        this.name = "ApiResponseError";
        this.message = "Http 500 Internal Server error: " + response.body.message;
        this.response = response;
        if (response.body.data.stack) {
            this.message += "\nResponse stack:\n" + response.body.data.stack + "\nEnd of response stack\n";
        }
    }
}
exports.ApiResponseError = ApiResponseError;
class ApiResponseBadRequestError extends ApiResponseError {
    constructor(response) {
        super(response);
        this.name = "ApiResponseBadRequestError";
        this.message = "Http 400 Bad request: " + (response.body.message || "No message!");
    }
}
exports.ApiResponseBadRequestError = ApiResponseBadRequestError;
class ApiResponseNotFoundError extends ApiResponseError {
    constructor(response) {
        super(response);
        this.name = "ApiResponseNotFoundError";
        this.message = "Http 404 Not found: " + response.body.message;
    }
}
exports.ApiResponseNotFoundError = ApiResponseNotFoundError;
function BuildErrorFromResponse(response) {
    switch (response.statusCode) {
        case 400:
            return new ApiResponseBadRequestError(response);
        case 404:
            return new ApiResponseNotFoundError(response);
        default:
            return new ApiResponseError(response);
    }
}
exports.BuildErrorFromResponse = BuildErrorFromResponse;
//# sourceMappingURL=response-error.js.map