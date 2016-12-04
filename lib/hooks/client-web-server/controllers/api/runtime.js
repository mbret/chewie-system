'use strict';

module.exports = function (router) {

    /**
     *
     */
    router.get("/scenarios", function(req, res) {
        let scenarios = [];
        // <Set>
        req.app.locals.system.runtime.scenarios.forEach(function(value) {
            scenarios.push(value);
        });

        return res.ok(scenarios);
    });
};
