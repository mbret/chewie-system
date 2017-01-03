"use strict";

import * as _ from "lodash";
import {ScenarioModel, ScenarioUpdatable} from "../models/scenario";
const util= require('util');
const validator = require('validator');

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
        let errors = {};

        checkScenario(req.body, errors);

        if(!_.isEmpty(errors)){
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
                server.io.emit("scenarios:updated", { created: [created.id] });

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

    router.get('/scenarios/:scenario', function(req, res) {
        let id = req.params.scenario;
        let search = {
            id: id
        };

        ScenarioDao
            .findOne({
                where: search
            })
            .then(function(entry){
                if(!entry){
                    return res.notFound();
                }

                return res.ok(entry.toJSON());
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
                server.io.emit("scenarios:updated", { deleted: [id] });

                return res.ok(deleted);
            })
            .catch(res.serverError);
    });

    router.put('/scenarios/:scenario', function(req, res) {
        let scenario = req.params.scenario;
        let name = req.body.name;
        let nodes = req.body.nodes;
        let description = req.body.description;
        let toUpdate: ScenarioUpdatable = {};

        // validate body
        let errors = {};

        checkScenario(req.body, errors);

        if(!_.isEmpty(errors)){
            return res.badRequest(errors);
        }

        // filter
        if (name) {
            toUpdate.name = name;
        }
        if (description) {
            toUpdate.description = description;
        }
        if (nodes) {
            toUpdate.nodes = nodes;
        }

        let where = { id: scenario };

        ScenarioDao
            .findOne({ where: where })
            .then(function(entry){
                if(!entry){
                    return res.notFound();
                }
                return entry.update(toUpdate).then(function(entryUpdated) {
                    server.logger.verbose("Scenario %s updated", entryUpdated.id);
                    server.io.emit("scenarios:updated", { updated: [entryUpdated.id] });
                    server.system.sharedApiService.post("/notifications", {content: "Scenario " + entryUpdated.id + " for system " + entryUpdated.deviceId + " has been updated", type: "info"}, { failSilently: true });

                    return res.ok(entryUpdated.toJSON());
                });
            })
            .catch(res.serverError);
    });

    function checkScenario(scenario: ScenarioModel, errors) {
        // check validity of nodes.
        // They should have an unique id
        if (scenario.nodes) {
            if (_.isEmpty(scenario.nodes)) {
                errors["nodes"] = "You need at least one node";
            } else {
                scenario.nodes.forEach(function(node) {
                    if (!node.id || !Number.isInteger(node.id)) {
                        errors["nodes"] = 'Invalid or missing id';
                    }
                });
            }
        }

        if (scenario.name !== undefined && (!_.isString(scenario.name) || _.isEmpty(scenario.name))) {
            errors["name"] = "Invalid";
        }
    }

    return router;
};

