'use strict';

export = function(server, router){

    /**
     * Return all plugins from local repository.
     */
    router.get('/api/repositories/local/plugins', function(req, res){
        let plugins = [0, 1, 2, 3];

        return res.ok(plugins);
    });

};