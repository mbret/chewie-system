"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require("lodash");
var ApiResponseError = (function (_super) {
    __extends(ApiResponseError, _super);
    function ApiResponseError(response) {
        var _this = _super.call(this) || this;
        // Handle some error that are not well formed
        // ex: request not even sent "cannot POST ..." or bad response from api
        if (_.isString(response.body)) {
            response.body = {
                message: response.body,
                data: {}
            };
        }
        _this.name = "ApiResponseError";
        _this.message = "Http 500 Internal Server error: " + response.body.message;
        _this.response = response;
        if (response.body.data.stack) {
            _this.message += "\nResponse stack:\n" + response.body.data.stack + "\nEnd of response stack\n";
        }
        return _this;
    }
    return ApiResponseError;
}(Error));
exports.ApiResponseError = ApiResponseError;
var ApiResponseBadRequestError = (function (_super) {
    __extends(ApiResponseBadRequestError, _super);
    function ApiResponseBadRequestError(response) {
        var _this = _super.call(this, response) || this;
        _this.name = "ApiResponseBadRequestError";
        _this.message = "Http 400 Bad request: " + (response.body.message || "No message!");
        return _this;
    }
    return ApiResponseBadRequestError;
}(ApiResponseError));
exports.ApiResponseBadRequestError = ApiResponseBadRequestError;
var ApiResponseNotFoundError = (function (_super) {
    __extends(ApiResponseNotFoundError, _super);
    function ApiResponseNotFoundError(response) {
        var _this = _super.call(this, response) || this;
        _this.name = "ApiResponseNotFoundError";
        _this.message = "Http 404 Not found: " + response.body.message;
        return _this;
    }
    return ApiResponseNotFoundError;
}(ApiResponseError));
exports.ApiResponseNotFoundError = ApiResponseNotFoundError;
function BuildErrorFromResponse(response) {
    switch (response.statusCode) {
        case 400:
            return new ApiResponseBadRequestError(response);
        case 404:
            return new ApiResponseNotFoundError(response);
        default:
            return new ApiResponseError(response);
    }
}
exports.BuildErrorFromResponse = BuildErrorFromResponse;
