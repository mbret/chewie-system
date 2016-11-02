'use strict';
var _ = require('lodash');
var google = require('googleapis');
var util = require('util');
var validator = require('validator');
module.exports = function (server, router) {
    var ScenarioDao = server.orm.models.Scenario;
    /**
     * Create a new scenario
     */
    router.post("/users/:user/scenarios", function (req, res) {
        var name = req.body.name;
        var description = req.body.description;
        var nodes = req.body.nodes;
        var userId = req.params.user;
        var scenario = {
            name: name,
            description: description,
            nodes: nodes,
            userId: userId
        };
        ScenarioDao.create(scenario)
            .then(function (created) {
            server.logger.verbose("Scenario %s created", created.id);
            setImmediate(function () {
                // Read the scenario
                server.system.scenarioReader.readScenario(created)
                    .catch(function (err) {
                    server.logger.error("Unable to read scenario", err);
                });
            });
            // Send response
            return res.created(created);
        })
            .catch(function (err) {
            if (err.name = "SequelizeUniqueConstraintError") {
                return res.badRequest(err);
            }
            return res.serverError(err);
        });
    });
    router.get("/users/:user/scenarios", function (req, res) {
        ScenarioDao.findAll()
            .then(function (results) {
            var data = [];
            results.forEach(function (res) {
                data.push(res.toJSON());
            });
            return res.ok(data);
        })
            .catch(res.serverError);
    });
    return router;
};
