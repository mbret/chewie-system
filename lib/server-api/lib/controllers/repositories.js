'use strict';
module.exports = function (server, router) {
    /**
     * Return all plugins from local repository.
     */
    router.get('/api/repositories/local/plugins', function (req, res) {
        server.system.localRepository.getPluginsInfo()
            .then(function (data) {
            return res.ok(data);
        })
            .catch(res.serverError);
    });
};
