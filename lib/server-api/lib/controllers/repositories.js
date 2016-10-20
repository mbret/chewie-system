'use strict';
module.exports = function (server, router) {
    /**
     * Return all plugins from local repository.
     */
    router.get('/api/repositories/local/plugins', function (req, res) {
        var plugins = [0, 1, 2, 3];
        return res.ok(plugins);
    });
};
