'use strict';
module.exports = function (router) {
    router.get('/local/plugins', function (req, res) {
        req.app.locals.system.localRepository.getPluginsInfo()
            .then(function (data) {
            return res.ok(data);
        })
            .catch(res.serverError);
    });
    router.get("/local/plugins/:name", function (req, res) {
        req.app.locals.system.localRepository.getPluginInfo(req.params.name)
            .then(function (data) {
            if (!data) {
                return res.notFound(data);
            }
            return res.ok(data);
        })
            .catch(res.serverError);
    });
};
