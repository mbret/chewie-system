"use strict";

module.exports = function(system, logger, done){
    return system.orm.models.User.findOne({where: {username: 'admin'}})
        .then(function(user){

            return system.localRepository
                .getPluginInfo({name: 'default-screen'})
                .then(function(packages){
                    return insertPlugin(user, packages)
                        .then(function(plugins){
                            return Promise.resolve();
                        });
                });
        })
        .then(function(){
            return done();
        })
        .catch(function(err){
            return done(err);
        });

    /**
     * Insert a repository package inside the db.
     * @param user
     * @param packages Repository package
     * @returns {*|Deferred|Promise.<Instance, created>}
     */
    function insertPlugin(user, packages){
        var packageJson = packages.modulePackage;
        var pluginPackage = packages.pluginPackage;
        return system.orm.models.Plugins.findOrCreate({
            where: {name: pluginPackage.name, userId: user.id},
            defaults: {
                modulePackage: packageJson,
                pluginPackage: pluginPackage,
                version: packageJson.version,
                description: packageJson.description,
                name: packageJson.name,
                userId: user.id
            }
        });
    }
};