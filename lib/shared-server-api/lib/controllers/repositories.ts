'use strict';

export = function(server, router){

    /**
     * Return all plugins from local repository.
     */
    router.get('/repositories/local/plugins', function(req, res){
        server.system.localRepository.getPluginsInfo()
            .then(function(data) {
                return res.ok(data);
            })
            .catch(res.serverError);
    });

    /**
     * Return info for specified plugin
     */
    router.get("/repositories/local/plugins/:name", function(req, res) {
        server.system.localRepository.getPluginInfo(req.params.name)
            .then(function(data) {
                if (!data) {
                    return res.notFound(data);
                }
                return res.ok(data);
            })
            .catch(res.serverError);
    });

};