"use strict";
import {System} from "../system";

export class SystemError extends Error implements Error {
    code: string;
    protected previousError: Error;

    public static CODE_PREFIX: string = "bError.";
    public static ERROR_CODE_DEFAULT = "ERROR_SYSTEM";
    public static ERROR_CODE_PLUGIN_ALREADY_MOUNTED = "ERROR_CODE_PLUGIN_ALREADY_MOUNTED";
    public static ERROR_CODE_PLUGIN_NOT_FOUNT = "ERROR_CODE_PLUGIN_NOT_FOUNT";
    public static ERROR_CODE_SCENARIO_NOT_FOUND = SystemError.CODE_PREFIX + "scenarioNotFound";

    constructor(message, code = SystemError.ERROR_CODE_DEFAULT, previousError: Error = null) {
        super(message);
        this.message = message;
        this.name = this.constructor.name;
        this.code = code;
        this.previousError = previousError;
        Error.captureStackTrace(this, this.constructor);
    }

    toString() {
        return this.constructor.name + ":" + this.message;
    }
}