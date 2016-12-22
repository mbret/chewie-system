"use strict";
class SystemError extends Error {
    constructor(message, code) {
        super(message);
        this.message = message;
        this.name = this.constructor.name;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
    toString() {
        return this.constructor.name + ":" + this.message;
    }
}
SystemError.CODE_PREFIX = "bError.";
exports.SystemError = SystemError;
