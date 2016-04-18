"use strict";

module.exports = function(system, logger, done){
    system.orm.models.User.findOne({where: {username: 'admin'}})
        .then(function(user){

            return system.localRepository
                .getPluginInfo({name: 'task-simple-message'})
                .then(function(packages){
                    var packageJson = packages.modulePackage;
                    var pluginPackage = packages.pluginPackage;

                    return system.orm.models.Plugins
                        .findOrCreate({
                            where: {name: pluginPackage.name, userId: user.id},
                            defaults: {
                                modulePackage: packageJson,
                                pluginPackage: pluginPackage,
                                version: packageJson.version,
                                description: packageJson.description,
                                name: packageJson.name,
                                userId: user.id
                            }
                        })
                        .then(function(plugins){
                            return Promise.all([
                                system.orm.models.Task.create({
                                    module: plugins[0].get('name') + ':simple-message',
                                    name: 'task 1',
                                    options: { foo: 'bar' },
                                    userId: user.id,
                                    triggers: [
                                        {
                                            type: 'manual',
                                            options: { text: 'coucou' },
                                            outputAdapters: ['voxygen', 'console']
                                        },
                                        {
                                            type: 'schedule',
                                            options: {'taskOptions.option1': 'coucou'},
                                            schedule: {
                                                method: 'moment',
                                                hour: 12,
                                                minute: 27
                                            }
                                        }
                                    ]
                                }),
                            ]);
                        });
                })
                .then(function(){
                    return system.localRepository
                        .getPluginInfo({name: 'output-adapter-voxygen'})
                        .then(function(packages){
                            var packageJson = packages.modulePackage;
                            var pluginPackage = packages.pluginPackage;

                            // create plugin
                            return Promise.all([
                                system.orm.models.Plugins.findOrCreate({
                                    where: {name: pluginPackage.name, userId: user.id},
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
                    return system.localRepository
                        .getPluginInfo({name: 'keypress-trigger'})
                        .then(function(packages){
                            var packageJson = packages.modulePackage;
                            var pluginPackage = packages.pluginPackage;

                            // create plugin
                            return Promise.all([
                                system.orm.models.Plugins.findOrCreate({
                                    where: {name: pluginPackage.name, userId: user.id},
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
                    return system.localRepository
                        .getPluginInfo({name: 'my-buddy-basics'})
                        .then(function(packages){
                            var packageJson = packages.modulePackage;
                            var pluginPackage = packages.pluginPackage;

                            // create plugin
                            return Promise.all([
                                system.orm.models.Plugins.findOrCreate({
                                    where: {name: pluginPackage.name, userId: user.id},
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
                    return system.localRepository
                        .getPluginInfo({name: 'task-alarm-clock'})
                        .then(function(packages){
                            var packageJson = packages.modulePackage;
                            var pluginPackage = packages.pluginPackage;

                            // create plugin
                            return Promise.all([
                                system.orm.models.Plugins.findOrCreate({
                                    where: {name: pluginPackage.name, userId: user.id},
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
                        //system.orm.models.Task.create({
                        //    module: 'simple-message:simple-message',
                        //    name: 'task 0',
                        //    options: { foo: 'bar' },
                        //    userId: user.id,
                        //    triggers: [
                        //        {
                        //            type: 'schedule',
                        //            options: {'taskOptions.option1': 'coucou'},
                        //            schedule: {
                        //                method: 'interval',
                        //                interval: 5000
                        //            }
                        //        },
                        //    ]
                        //}),

                        system.orm.models.Task.create({
                            module: 'task-alarm-clock:alarm-clock',
                            name: 'Reveil',
                            description: 'Reveil matin',
                            userId: user.id,
                            triggers: [
                                //{
                                //    type: 'direct',
                                //    options: { action: 'start', repeat: true },
                                //    schedule: {
                                //        interval: 94000,
                                //        method: 'interval'
                                //    }
                                //    //schedule: {
                                //    //    method: 'moment',
                                //    //    dayOfWeek: [0,1,3,4,5],
                                //    //    hour: 9,
                                //    //    minute: 0,
                                //    //    second: 0
                                //    //}
                                //},
                                {
                                    type: 'manual',
                                    options: { action: 'stop' },
                                },
                                {
                                    type: 'manual',
                                    options: { action: 'start', repeat: true },
                                },
                            ]
                        }),
                    ]);
                });
        })
        .then(function(){
            return done();
        })
        .catch(done);
};