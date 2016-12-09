'use strict';

module.exports = function (router) {

    router.get('/', function(req, res){
        let PluginsDao = req.app.locals.system.apiServer.orm.models.Plugins;
        // let user = req.params.user;

        PluginsDao
            .findAll({
                where: {
                    // userId: user
                }
            })
            .then(function(plugins){
                if(!plugins){
                    return res.notFound('Invalid user id');
                }

                return res.ok(plugins.map( item => item.toJSON() ));
            })
            .catch(res.serverError);
    });

    /**
     * Fetch modules for a user.
     * You can filter modules by their types.
     */
    router.get('/modules', function(req, res) {
        let modules = [];
        // @todo doit être dans la db interne
        let PluginsDao = req.app.locals.system.apiServer.orm.models.Plugins;
        // Get all plugin name
        PluginsDao.findAll()
            .then(function(plugins) {
                plugins.forEach(function(plugin) {
                    // let info = getPluginInfo(req, plugin.name);
                    let tmp = plugin.package.modules
                        .filter(function(item){
                            if (!req.query.type) {
                                return item;
                            }
                            return item.type === req.query.type;
                        })
                        .map(function(item){
                            item.plugin = plugin;
                            item.userOptions = plugin.userOptions[item.id];
                            return item;
                        });
                    modules = modules.concat(tmp);
                });

                return res.ok(modules);
            })
            .catch(res.serverError);
    });

    /**
     * Return the plugin details from database.
     * You can use "extraInfo" param to gather info from the installed plugin (ex description, author, modules, etc)
     */
    router.get('/:plugin', function(req, res){
        let PluginsDao = req.app.locals.system.apiServer.orm.models.Plugins;
        // let userId = req.params.user;
        let name = req.params.plugin;

        let search = {
            // userId: userId,
            name: name
        };

        PluginsDao
            .findOne({
                where: search
            })
            .then(function(plugin){
                if(!plugin){
                    return res.notFound();
                }

                // fetch info from installed folder
                // let info = getPluginInfo(req, pluginName);

                return res.ok(plugin.toJSON());
            })
            .catch(res.serverError);
    });

    function getPluginInfo(req, pluginName) {
        return req.app.locals.system.pluginsLoader.getPluginInfo(pluginName);
    }
};
