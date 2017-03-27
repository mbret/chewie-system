"use strict";

import * as _ from "lodash";
const util= require('util');
const validator = require('validator');

module.exports = function(server, router) {

    router.put("/system-config/:device", function(req, res) {
        // let HookOptionDao = server.orm.models.HookOption;
        // let deviceId = req.params.device;
        // let hookName = req.params.hook;
        // let newData = req.body.options;
        //
        // // validate body
        // let errors = {};
        //
        // if(!_.isEmpty(errors)){
        //     return res.badRequest(errors);
        // }
        //
        // HookOptionDao
        //     .findOne({ where: {
        //         deviceId: deviceId,
        //         hookName: hookName,
        //     } })
        //     .then(function(entry) {
        //         // Create
        //         if(!entry){
        //             let data = { deviceId: deviceId, hookName: hookName, data: newData };
        //             return HookOptionDao
        //                 .create(data)
        //                 .then(function(created) {
        //                     server.logger.verbose("Hook config for [%s] created with id [%s]", hookName, created.id);
        //                     server.io.emit("hooks-config:created", created.toJSON());
        //                     return res.created(created.toJSON());
        //                 });
        //         }
        //         // Update
        //         return entry
        //             .update({deviceId: req.params.device, hookName: hookName, data: newData})
        //             .then(function(entryUpdated) {
        //                 server.logger.verbose("Hook config for [%s] with id [%s] updated", hookName, entryUpdated.id);
        //                 server.io.emit("hooks-config:updated", entryUpdated.toJSON());
        //                 return res.ok(entryUpdated.toJSON());
        //             });
        //     })
        //     .catch(res.serverError);
    });

    router.get("/system-config/:device", function(req, res) {
        let SystemConfigDao = server.orm.models.SystemConfig;
        let deviceId = req.params.device;

        SystemConfigDao
            .findOne({ where: {
                deviceId: deviceId,
            } })
            .then(function(entry){
                if(!entry) {
                    return res.notFound();
                }
                return res.ok(entry.toJSON());
            })
            .catch(res.serverError);
    });

    return router;
};

