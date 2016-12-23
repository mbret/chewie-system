'use strict';
let _ = require('lodash');
let google = require('googleapis');
let util = require('util');
let validator = require('validator');
module.exports = function (server, router) {
    let ScenarioDao = server.orm.models.Scenario;
    router.post("/devices/:device/scenarios", function (req, res) {
        let name = req.body.name;
        let description = req.body.description;
        let nodes = req.body.nodes;
        let deviceId = req.params.device;
        let errors = new Map();
        nodes.forEach(function (node) {
            if (!node.id || !Number.isInteger(node.id)) {
                errors.set('nodes', 'Invalid or missing id');
            }
        });
        if (errors.size > 0) {
            return res.badRequest(errors);
        }
        let scenario = {
            name: name,
            description: description,
            nodes: nodes,
            deviceId: deviceId
        };
        ScenarioDao.create(scenario)
            .then(function (created) {
            server.logger.verbose("Scenario %s created", created.id);
            server.io.emit("user:scenario:created", created);
            return res.created(created);
        })
            .catch(function (err) {
            if (err.name = "SequelizeUniqueConstraintError") {
                return res.badRequest(err);
            }
            return res.serverError(err);
        });
    });
    router.get("/devices/:device/scenarios", function (req, res) {
        ScenarioDao
            .findAll({
            where: {
                deviceId: req.params.device
            }
        })
            .then(function (results) {
            return res.ok(results.map(function (res) {
                return res.toJSON();
            }));
        })
            .catch(res.serverError);
    });
    return router;
};
