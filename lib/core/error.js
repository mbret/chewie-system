"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SystemError = (function (_super) {
    __extends(SystemError, _super);
    function SystemError(message, code) {
        var _this = _super.call(this, message) || this;
        _this.message = message;
        _this.name = _this.constructor.name;
        _this.code = code;
        Error.captureStackTrace(_this, _this.constructor);
        return _this;
    }
    SystemError.prototype.toString = function () {
        return this.constructor.name + ":" + this.message;
    };
    return SystemError;
}(Error));
SystemError.CODE_PREFIX = "bError.";
exports.SystemError = SystemError;
