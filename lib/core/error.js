"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SystemError = (function (_super) {
    __extends(SystemError, _super);
    function SystemError(message, code) {
        _super.call(this, message);
        this.message = message;
        this.name = this.constructor.name;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
    SystemError.prototype.toString = function () {
        return this.constructor.name + ":" + this.message;
    };
    SystemError.CODE_PREFIX = "bError.";
    return SystemError;
}(Error));
exports.SystemError = SystemError;
