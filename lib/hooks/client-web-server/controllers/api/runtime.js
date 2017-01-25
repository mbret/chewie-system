'use strict';
module.exports = function (router) {
    router.get("/scenarios", function (req, res) {
        let scenarios = [];
        req.app.locals.system.scenarioReader.getRunningScenarios().forEach(function (value) {
            scenarios.push(value);
        });
        return res.ok(scenarios);
    });
    router.post("/scenarios/:scenario", function (req, res) {
        let scenarioId = req.params.scenario;
        let server = req.app.locals.server;
        req.app.locals.system.sharedApiService.getScenario(scenarioId)
            .then(function (scenario) {
            if (!scenario) {
                return res.badRequest("Invalid scenario id");
            }
            setImmediate(function () {
                return server.system.scenarioReader.readScenario(scenario, { loadPlugins: true });
            });
            return res.ok(scenario);
        })
            .catch(res.serverError);
    });
    router.delete("/scenarios/:scenario", function (req, res) {
        let scenarioId = req.params.scenario;
        let server = req.app.locals.server;
        if (!server.system.scenarioReader.hasScenario(scenarioId)) {
            return res.notFound("Invalid execution id");
        }
        server.system.scenarioReader.stopScenario(scenarioId)
            .then(function () {
            return res.ok();
        })
            .catch(function (err) {
            return res.serverError(err);
        });
    });
};
