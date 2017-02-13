"use strict";

let error: any = module.exports = {};

class BadRequestError extends Error {

    BadRequestError: boolean;

    constructor(message) {
        super(message);
        this.BadRequestError = true;
        this.message = message;
    }
}

error.BadRequestError = BadRequestError;
