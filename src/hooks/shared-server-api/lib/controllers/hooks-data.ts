"use strict";

import * as _ from "lodash";
const util= require('util');
const validator = require('validator');

module.exports = function(server, router) {

    router.post("/devices/:device/hooks/:hook/data", function(req, res) {
        let HookDataDao = server.orm.models.HookData;
        let key = req.body.key;
        let data = req.body.data;

        // validate body
        let errors = {};

        if(!_.isEmpty(errors)){
            return res.badRequest(errors);
        }

        HookDataDao
            .findOne({
                where: {
                    deviceId: req.params.device,
                    hookName: req.params.hook,
                    key: key,
                }
            })
            .then(function(entry){
                if(entry){
                    return res.badRequest({code: "alreadyExist"});
                }

                // create
                let toCreate = {
                    deviceId: req.params.device,
                    hookName: req.params.hook,
                    key: key,
                    data: data
                };
                return HookDataDao
                    .create(toCreate)
                    .then(function(created) {
                        return res.created(created.toJSON());
                    });
            })
            .catch(res.serverError);
    });

    router.put("/devices/:device/hooks/:hook/data/:key", function(req, res) {
        let HookDataDao = server.orm.models.HookData;
        let deviceId = req.params.device;
        let key = req.params.key;
        let hookName = req.params.hook;
        let newData = req.body.data;
        let partial = req.body.partial;

        // validate body
        let errors = {};

        if(!_.isEmpty(errors)){
            return res.badRequest(errors);
        }

        HookDataDao
            .findOne({ where: {
                deviceId: deviceId,
                hookName: hookName,
                key: key,
            } })
            .then(function(entry){
                if(!entry){
                    return res.notFound();
                }
                let data = entry.data;
                if (partial) {
                    data = _.merge(data, newData);
                }
                return entry
                    .update({
                        deviceId: req.params.device,
                        hookName: req.params.hook,
                        key: key,
                        data: data
                    })
                    .then(function(entryUpdated) {
                        server.logger.verbose("Hook data %s updated", entryUpdated.id);
                        return res.ok(entryUpdated.toJSON());
                    });
            })
            .catch(res.serverError);
    });

    router.get("/devices/:device/hooks/:hook/data/:key", function(req, res) {
        let HookDataDao = server.orm.models.HookData;
        let deviceId = req.params.device;
        let key = req.params.key;
        let hookName = req.params.hook;

        HookDataDao
            .findOne({ where: {
                deviceId: deviceId,
                hookName: hookName,
                key: key,
            } })
            .then(function(entry){
                if(!entry){
                    return res.notFound();
                }
                return res.ok(entry.toJSON());
            })
            .catch(res.serverError);
    });

    return router;
};

