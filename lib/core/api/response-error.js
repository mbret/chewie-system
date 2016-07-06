"use strict";

class ApiResponseError extends Error {
    constructor(response) {
        super();
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
        this.message = "Http 400 Bad Request: " + response.body.message;
    }
}

module.exports = {
    ApiResponseError: ApiResponseError,
    ApiResponseBadRequestError: ApiResponseBadRequestError,
    BuildErrorFromResponse: function(response) {
        switch(response.statusCode) {
            case 400:
                return new ApiResponseBadRequestError(response);
            default:
                return new ApiResponseError(response);
        }
    }
};