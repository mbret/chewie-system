"use strict";

module.exports = function(system, logger, done){
    system.orm.models.User.findOne({where: {username: 'admin'}})
        .then(function(user){
            // extract plugin
            return system.localRepository.loadPlugin('simple-message')
                .then(function(module, packageInfo){
                    // create plugin
                    return system.orm.models.Plugins
                        .findOrCreate({
                            where: {package:'simple-message'},
                            defaults: {
                                package: 'simple-message',
                                userId: user.id
                            }
                        })
                        // Create module
                        .then(function(plugin){
                            return system.orm.models.Modules.findOrCreate({
                                where: {type: 'task-module', name: 'simple-message', pluginId: plugin[0].id},
                                defaults: {
                                    type: 'task-module',
                                    name: 'simple-message',
                                    pluginId: plugin[0].id
                                }
                            })
                        });
                });
        })
        .then(function(){
            return done();
        })
        .catch(done);
};