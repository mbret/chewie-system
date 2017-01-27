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
SystemError.ERROR_CODE_PLUGIN_ALREADY_LOADED = "ERROR_CODE_PLUGIN_ALREADY_LOADED";
SystemError.ERROR_CODE_SCENARIO_NOT_FOUND = SystemError.CODE_PREFIX + "scenarioNotFound";
SystemError.CODE_PREFIX = "bError.";
exports.SystemError = SystemError;
//# sourceMappingURL=error.js.map