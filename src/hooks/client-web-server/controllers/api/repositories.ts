'use strict';

module.exports = function(router){

    /**
     * Return all plugins from local repository.
     */
    router.get('/local/plugins', function(req, res){
        req.app.locals.system.localRepository.fetchAllPluginsPackageInfo()
            .then(function(data) {
                return res.ok(data);
            })
            .catch(res.serverError);
    });

    /**
     * Return info for specified plugin
     */
    router.get("/local/plugins/:name", function(req, res) {
        req.app.locals.system.localRepository.getPluginInfo(req.params.name)
            .then(function(data) {
                if (!data) {
                    return res.notFound(data);
                }
                return res.ok(data);
            })
            .catch(res.serverError);
    });

};