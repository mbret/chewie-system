'use strict';

module.exports = function (router) {

    /**
     * Return the plugin details from database.
     * You can use "extraInfo" param to gather info from the installed plugin (ex description, author, modules, etc)
     */
    router.get('/plugins/:plugin', function(req, res){
        let pluginName = req.params.plugin;

        // fetch info from installed folder
        let info = getPluginInfo(req, pluginName);

        setTimeout(function() {
            return res.ok(info);
        }, 1000);
    });

    /**
     * Fetch modules for a user.
     * You can filter modules by their types.
     */
    router.get('/users/:id/modules', function(req, res) {
        let modules = [];
        // @todo doit être dans la db interne
        let PluginsDao = req.app.locals.system.apiServer.orm.models.Plugins;
        // Get all plugin name
        PluginsDao.findAll()
            .then(function(plugins) {
                plugins.forEach(function(plugin) {
                    let info = getPluginInfo(req, plugin.name);
                    let tmp = info.modules
                        .filter(function(item){
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

    function getPluginInfo(req, pluginName) {
        return req.app.locals.system.pluginsLoader.getPluginInfo(pluginName);
    }
};
