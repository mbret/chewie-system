import * as _ from "lodash";

export default function(req, res, next){
    res.set("chewie-version", req.app.locals.server.system.info.version);

    /**
     * 400
     * @param err
     * @param options
     */
    res.badRequest = function(err, options = {}) {
        let message = "Bad request";
        let error = {};
        if(_.isString(err)) {
            message = err;
            err = {};
        }
        let errResponse = {
            status: "error",
            code: err.code || "badRequest",
            message: err.message || message,
            data: err.data || {}
        };

        return res.status(400).send(errResponse);
    };

    res.created = function(data){
        return res.status(201).send(data);
    };

    res.ok = function(data){
        return res.status(200).send(data);
    };

    res.notFound = function(data){
        let errResponse: any = {};
        errResponse.status = "error";
        errResponse.code = "notFound";
        errResponse.message = data;
        errResponse.data = {};
        return res.status(404).json(errResponse);
    };

    res.updated = function(data){
        return res.status(200).send(data);
    };

    res.unauthorized = function(data) {
        return res.status(401).json({});
    };

    /**
     * http://jsonapi.org/format/#errors-processing
     * https://labs.omniti.com/labs/jsend
     * @param err
     * @returns {*}
     */
    res.serverError = function(err) {
        req.app.locals.server.logger.error("Send 500 response", err);
        return req.app.locals.server.serverError(res, err);
    };

    return next();
}