'use strict';

module.exports = function (router) {

    /**
     *
     */
    router.get("/scenarios", function(req, res) {
        let scenarios = [];
        // <Set>
        req.app.locals.system.scenarioReader.getRunningScenarios().forEach(function(value) {
            scenarios.push(value);
        });

        return res.ok(scenarios);
    });
};
