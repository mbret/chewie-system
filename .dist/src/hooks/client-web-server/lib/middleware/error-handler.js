"use strict";
module.exports = function () {
    return function (error, req, res, next) {
        req.app.locals.server.logger.error("An error has been thrown inside middleware and has been catch by 500 error handle: " + error.stack);
        return res.status(500).send({
            error: error.message,
            stack: error.stack
        });
    };
};
//# sourceMappingURL=error-handler.js.map