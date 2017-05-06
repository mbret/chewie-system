'use strict';

module.exports = function (router) {

    /**
     * Return the plugin details from database.
     * You can use "extraInfo" param to gather info from the installed plugin (ex description, author, modules, etc)
     */
    // router.get('/:plugin', function(req, res){
    //     let PluginsDao = req.app.locals.system.apiServer.orm.models.Plugins;
    //     // let userId = req.params.user;
    //     let name = req.params.plugin;
    //
    //     let search = {
    //         // userId: userId,
    //         name: name
    //     };
    //
    //     PluginsDao
    //         .findOne({
    //             where: search
    //         })
    //         .then(function(plugin){
    //             if(!plugin){
    //                 return res.notFound();
    //             }
    //
    //             // fetch info from installed folder
    //             // let info = getPluginInfo(req, pluginName);
    //
    //             return res.ok(plugin.toJSON());
    //         })
    //         .catch(res.serverError);
    // });

    // function getPluginInfo(req, pluginName) {
    //     return req.app.locals.system.pluginsLoader.getPluginInfo(pluginName);
    // }
};
