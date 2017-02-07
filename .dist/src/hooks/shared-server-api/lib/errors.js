"use strict";
var error = module.exports = {};
class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.BadRequestError = true;
        this.message = message;
    }
}
error.BadRequestError = BadRequestError;
//# sourceMappingURL=errors.js.map