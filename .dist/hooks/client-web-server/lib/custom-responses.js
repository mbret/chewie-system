"use strict";
const _ = require("lodash");
function customResponses(req, res, next) {
    res.badRequest = function (data) {
        if (_.isString(data)) {
            data = { message: data };
        }
        data.data = data.data || {};
        if (data.errors) {
            data.data.errors = data.errors;
        }
        var errResponse = {
            status: data.status || "error",
            code: data.code || "badRequest",
            message: data.message || "",
            data: data.data || {}
        };
        return res.status(400).send(errResponse);
    };
    res.created = function (data) {
        return res.status(201).send(data);
    };
    res.ok = function (data) {
        return res.status(200).send(data);
    };
    res.notFound = function (data) {
        var errResponse = {};
        errResponse.status = "error";
        errResponse.code = "notFound";
        errResponse.message = data;
        errResponse.data = {};
        return res.status(404).send(errResponse);
    };
    res.updated = function (data) {
        return res.status(200).send(data);
    };
    res.serverError = function (err) {
        let errResponse = {};
        errResponse.status = "error";
        errResponse.code = "serverError";
        errResponse.message = "An internal error occured";
        errResponse.data = {};
        if (err instanceof Error) {
            errResponse = _.merge(errResponse, { message: err.message, data: { stack: err.stack, code: err.code } });
        }
        if (_.isString(err)) {
            errResponse.message = err;
        }
        return res.status(500).send(errResponse);
    };
    return next();
}
exports.customResponses = customResponses;
//# sourceMappingURL=custom-responses.js.map