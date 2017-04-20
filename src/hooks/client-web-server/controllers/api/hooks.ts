'use strict';

import * as _ from "lodash";
import {HookContainer} from "../../../../core/hook-container";

module.exports = function (router) {

    router.get("/", function(req, res) {
        return res.ok(Object.keys(req.app.locals.system.hooks).map(function(key) {
            let container: HookContainer = req.app.locals.system.hooks[key];
            return {
                name: key,
                packageInfo: {
                    version: container.version,
                    type: container.type
                }
            }
        }));
    });

    router.get("/:name", function(req, res) {
        let name = req.params.name;
        let found = Object.keys(req.app.locals.system.hooks).find(key => key === name);
        if (!found) {
            return res.notFound();
        }

        let container: HookContainer = req.app.locals.system.hooks[found];
        return res.ok({
            name: found,
            packageInfo: {
                version: container.version,
                type: container.type
            }
        });
    });
};
