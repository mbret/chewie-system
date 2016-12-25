'use strict';

let _ = require('lodash');
let google = require('googleapis');
let util= require('util');
let validator = require('validator');

module.exports = function(server, router) {

    let ScenarioDao = server.orm.models.Scenario;

    /**
     * Create a new scenario.
     */
    router.post("/devices/:device/scenarios", function(req, res) {
        let name = req.body.name;
        let description = req.body.description;
        let nodes = req.body.nodes;
        let deviceId = req.params.device;

        // validate body
        let errors = new Map();

        // check validity of nodes.
        // They should have an unique id
        nodes.forEach(function(node) {
            if (!node.id || !Number.isInteger(node.id)) {
                errors.set('nodes', 'Invalid or missing id');
            }
        });

        if(errors.size > 0){
            return res.badRequest(errors);
        }

        let scenario = {
            name: name,
            description: description,
            nodes: nodes,
            deviceId: deviceId
        };

        ScenarioDao.create(scenario)
            .then(function(created) {
                server.logger.verbose("Scenario %s created", created.id);
                server.io.emit("scenario:created", created);

                return res.created(created);
            })
            .catch(function(err) {
                if(err.name = "SequelizeUniqueConstraintError") {
                    return res.badRequest(err);
                }
                return res.serverError(err);
            });
    });

    router.get("/devices/:device/scenarios", function(req, res) {
        ScenarioDao
            .findAll({
                where: {
                    deviceId: req.params.device
                }
            })
            .then(function(results) {
                return res.ok(results.map(function(res) {
                    return res.toJSON();
                }));
            })
            .catch(res.serverError);
    });

    router.delete("/scenarios/:scenario", function(req, res) {
        let id = parseInt(req.params.scenario);
        let query = {
            where: {
                id: id
            }
        };

        ScenarioDao.destroy(query)
            .then(function(rows) {
                if (rows === 0) {
                    return res.notFound();
                }
                let deleted = {id: id};
                server.io.emit("scenario:deleted", deleted);

                // fetch new list of scenario to emit update events
                ScenarioDao.findAll()
                    .then(function(scenarios) {
                        server.io.emit("scenarios:updated", scenarios.map( item => item.toJSON() ));
                    });

                return res.ok(deleted);
            })
            .catch(res.serverError);
    });

    return router;
};

