'use strict';
import {ScenarioModel} from "../../../shared-server-api/lib/models/scenario";
import ClientWebServer from "../../server";
import ScenarioReadable from "../../../../core/scenario/scenario-readable";
import {SystemError} from "../../../../core/error";

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

    router.post("/scenarios/:scenario", function(req, res) {
        let scenarioId = req.params.scenario;
        let server: ClientWebServer = req.app.locals.server;

        // first fetch scenario
        req.app.locals.system.sharedApiService.getScenario(scenarioId)
            .then(function(scenario: ScenarioModel) {
                if (!scenario) {
                    return res.badRequest("Invalid scenario id");
                }

                setImmediate(function() {
                    // read scenario and explicitly lad plugins if they are not available
                    return server.system.scenarioReader.startScenario(scenario, { loadPlugins: true });
                });

                return res.ok(scenario);
            })
            .catch(res.serverError);
    });

    router.delete("/scenarios/:scenario", function(req, res) {
        let scenarioId = req.params.scenario;
        let server: ClientWebServer = req.app.locals.server;

        return server.system.scenarioReader.isRunning(scenarioId)
            .then(function(running) {
                if (!running) {
                    return res.notFound("Invalid execution id");
                }

                server.system.scenarioReader.stopScenario(scenarioId)
                    .then(function() {
                        return res.ok();
                    })
                    .catch(function(err) {
                        if (err.code !== SystemError.ERROR_CODE_SCENARIO_NOT_FOUND) {
                            return res.serverError(err);
                        }
                    });
            });
    });
};
