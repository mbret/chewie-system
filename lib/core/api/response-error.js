"use strict";

class ApiResponseError extends Error {
    constructor(response) {
        super("df");
        this.name = "ApiResponseError";
        this.message = "Http 500 Internal Server error: " + response.body.message;
        this.response = response;
        if(response.body.data.stack) {
            this.message += "\nResponse stack:\n" + response.body.data.stack + "\nEnd of response stack\n";
        }
    }
}

module.exports = ApiResponseError;