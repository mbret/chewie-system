"use strict";

let _ = require("lodash");

export class ApiResponseError extends Error {

    response: any;
    data: any;
    status: number;

    constructor(response) {
        super();

        // Handle some error that are not well formed
        // ex: request not even sent "cannot POST ..." or bad response from api
        if(_.isString(response.body)) {
            response.body = {};
        }
        // default response body if needed
        response.body = Object.assign({
            message: response.body,
            data: {}
        }, response.body);
        this.status = response.status;
        this.data = response.body;
        this.name = "ApiResponseError";
        this.message = "Http 500 Internal Server error: " + response.body.message;
        this.response = response;
        if(response.body.data.stack) {
            this.message += "\nResponse stack:\n" + response.body.data.stack + "\nEnd of response stack\n";
        }
    }
}

export class ApiResponseBadRequestError extends ApiResponseError {
    constructor(response) {
        super(response);

        this.name = "ApiResponseBadRequestError";
        this.message = "Http 400 Bad request: " + (response.body.message || "No message!");
    }
}

export class ApiResponseNotFoundError extends ApiResponseError {
    constructor(response) {
        super(response);

        this.name = "ApiResponseNotFoundError";
        this.message = "Http 404 Not found: " + response.body.message;
    }
}

export class ApiResponseUnauthorizedError extends ApiResponseError {
    constructor(response) {
        super(response);

        this.name = "ApiResponseUnauthorizedError";
        this.message = "Http 401 Unauthorized: " + response.body.message;
    }
}