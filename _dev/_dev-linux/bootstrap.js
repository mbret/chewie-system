"use strict";

module.exports = function(system, logger, done){

    // create new user
    system.apiService
        .findOrCreateUser({
            username: "mbret"
        })
        .then(function() {
            return system.apiService.findUserByUsername("admin")
                .then(function(user) {
                    return Promise
                        .resolve()
                        // radio plugin
                        .then(function() {
                            return system.localRepository
                                .getPluginInfo({name: 'radio'})
                                // insert plugin
                                .then(function(buddyPackage){
                                    return insertPlugin(user, buddyPackage);
                                });
                        });
                });
        })
        .then(function(){
            return done();
        })
        .catch(function(err){
            return done(err);
        });

    function insertPlugin(user, packages) {
        var packageJson = packages.modulePackage;
        var pluginPackage = packages.pluginPackage;
        var data = {
            modulePackage: packageJson,
            pluginPackage: pluginPackage,
            version: packageJson.version,
            description: packageJson.description,
            name: packageJson.name
        };
        return system.apiService
            .findOrCreatePlugin(user.id, packageJson.name, data)
            .then(function(plugin) {
                return system.apiService.updatePlugin(user.id, plugin.id, {pluginPackage: pluginPackage});
            });
    }
};