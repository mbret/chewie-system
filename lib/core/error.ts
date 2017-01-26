"use strict";

export class SystemError extends Error implements Error {
    code: string;

    public static ERROR_CODE_PLUGIN_ALREADY_LOADED = "ERROR_CODE_PLUGIN_ALREADY_LOADED";
    public static ERROR_CODE_SCENARIO_NOT_FOUND = SystemError.CODE_PREFIX + "scenarioNotFound";
    public static CODE_PREFIX: string = "bError.";

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