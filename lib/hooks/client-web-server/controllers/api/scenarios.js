'use strict';

module.exports = function (router) {

    router.delete("/:scenario", function(req, res) {
        let id = parseInt(req.params.scenario);
        let ScenarioDao = req.app.locals.system.sharedApiServer.orm.models.Scenario;
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
                req.app.locals.system.sharedApiServer.io.emit("scenario:deleted", deleted);

                // fetch new list of scenario to emit update events
                ScenarioDao.findAll()
                    .then(function(scenarios) {
                        req.app.locals.system.sharedApiServer.io.emit("scenarios:updated", scenarios.map( item => item.toJSON() ));
                    });

                return res.ok(deleted);
            })
            .catch(res.serverError);
    });

};
