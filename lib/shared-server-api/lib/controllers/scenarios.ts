'use strict';

var _ = require('lodash');
var google = require('googleapis');
var util= require('util');
var validator = require('validator');

module.exports = function(server, router) {

    var ScenarioDao = server.orm.models.Scenario;

    /**
     * Create a new scenario.
     */
    router.post("/users/:user/scenarios", function(req, res) {
        let name = req.body.name;
        let description = req.body.description;
        let nodes = req.body.nodes;
        let userId = parseInt(req.params.user);

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

        var scenario = {
            name: name,
            description: description,
            nodes: nodes,
            userId: userId
        };

        ScenarioDao.create(scenario)
            .then(function(created) {
                server.logger.verbose("Scenario %s created", created.id);
                server.io.emit("user:scenario:created", created);

                return res.created(created);
            })
            .catch(function(err) {
                if(err.name = "SequelizeUniqueConstraintError") {
                    return res.badRequest(err);
                }
                return res.serverError(err);
            });
    });

    router.get("/users/:user/scenarios", function(req, res) {
        ScenarioDao.findAll()
            .then(function(results) {
                var data = [];
                results.forEach(function(res) {
                    data.push(res.toJSON());
                });

                return res.ok(data);
            })
            .catch(res.serverError);
    });

    return router;
};

