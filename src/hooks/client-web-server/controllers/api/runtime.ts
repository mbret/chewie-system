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
        req.app.locals.system.scenarioReader.getScenarios().forEach(function(value) {
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

                // read scenario and explicitly lad plugins if they are not available
                return server.system.scenarioReader.startScenario(scenario)
                    .then(() => res.ok());
            })
            .catch(function(err) {
                if (err.code === SystemError.ERROR_CODE_PLUGIN_MISSING) {
                    return res.badRequest("Plugin does not exist");
                }
                return res.serverError(err);
            });
    });

    router.delete("/scenarios/:executionId", function(req, res) {
        let scenarioId = req.params.executionId;
        let server: ClientWebServer = req.app.locals.server;

        if (!server.system.scenarioReader.getScenarios().find((item) => item.executionId === scenarioId)) {
            return res.notFound("Invalid execution id");
        }

        server.system.scenarioReader.stopScenario(scenarioId)
            .then(function() {
                return res.ok();
            })
            .catch(res.serverError);
    });
};
