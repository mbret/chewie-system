"use strict";

module.exports = function(system, logger, done){
    system.orm.models.User.findOne({where: {username: 'admin'}})
        .then(function(user){

            return system.localRepository
                .getPluginInfo({name: 'simple-message'})
                .then(function(packages){
                    var packageJson = packages[0];
                    var pluginPackage = packages[1];
                    return system.orm.models.Plugins.findOrCreate({
                        where: {name:'simple-message', userId: user.id},
                        defaults: {
                            modulePackage: packageJson,
                            pluginPackage: pluginPackage,
                            version: packageJson.version,
                            description: packageJson.description,
                            name: packageJson.name,
                            userId: user.id
                        }
                    });
                })
                .then(function(){
                    return system.localRepository
                        .getPluginInfo({name: 'keypress-trigger'})
                        .then(function(packages){
                            var packageJson = packages[0];
                            var pluginPackage = packages[1];

                            // create plugin
                            return Promise.all([
                                system.orm.models.Plugins.findOrCreate({
                                    where: {name:'keypress-trigger', userId: user.id},
                                    defaults: {
                                        modulePackage: packageJson,
                                        pluginPackage: pluginPackage,
                                        version: packageJson.version,
                                        description: packageJson.description,
                                        name: packageJson.name,
                                        userId: user.id
                                    }
                                })
                            ]);
                        });
                })
                .then(function(){
                    // create task
                    return Promise.all([
                        system.orm.models.Tasks.create({
                            module: 'simple-message:simple-message',
                            name: 'task 1',
                            options: { foo: 'bar' },
                            userId: user.id,
                            triggers: [
                                //{
                                //    type: 'direct',
                                //    options: {'taskOptions.option1': 'coucou'},
                                //},
                                //{
                                //    type: 'schedule',
                                //    options: {'taskOptions.option1': 'coucou'},
                                //    schedule: {
                                //        method: 'interval',
                                //        interval: 1000
                                //    }
                                //},
                                //{
                                //    type: 'schedule',
                                //    options: {'taskOptions.option1': 'coucou'},
                                //    schedule: {
                                //        method: 'moment',
                                //        date: new Date()
                                //    }
                                //}
                                {
                                    type: 'schedule',
                                    options: {'taskOptions.option1': 'coucou'},
                                    schedule: {
                                        method: 'moment',
                                        date: new Date()
                                    }
                                }
                            ]
                        })
                    ]);
                });
        })
        .then(function(){
            return done();
        })
        .catch(done);
};