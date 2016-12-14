'use strict';
module.exports = function (server, router) {
    router.get('/repositories/local/plugins', function (req, res) {
        server.system.localRepository.getPluginsInfo()
            .then(function (data) {
            return res.ok(data);
        })
            .catch(res.serverError);
    });
    router.get("/repositories/local/plugins/:name", function (req, res) {
        server.system.localRepository.getPluginInfo(req.params.name)
            .then(function (data) {
            if (!data) {
                return res.notFound(data);
            }
            return res.ok(data);
        })
            .catch(res.serverError);
    });
};
