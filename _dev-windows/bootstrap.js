"use strict";

module.exports = function(system, logger, done){
    return system.orm.models.User.findOne({where: {username: 'admin'}})
        .then(function(user){

            return system.localRepository
                .getPluginInfo({name: 'task-simple-message'})
                .then(function(packages){
                    return insertPlugin(user, packages)
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
                // .then(function(){
                //     return system.localRepository
                //         .getPluginInfo({name: 'output-adapter-voxygen'})
                //         .then(function(packages){
                //             return insertPlugin(user, packages);
                //         });
                // })
                // .then(function(){
                //     return system.localRepository
                //         .getPluginInfo({name: 'keypress-trigger'})
                //         .then(function(packages){
                //             return insertPlugin(user, packages);
                //         });
                // })
                // .then(function(){
                //     return system.localRepository
                //         .getPluginInfo({name: 'my-buddy-basics'})
                //         .then(function(packages){
                //             return insertPlugin(user, packages);
                //         });
                // })
                //.then(function(){
                //    return system.localRepository
                //        .getPluginInfo({name: 'task-alarm-clock'})
                //        .then(function(packages){
                //            return insertPlugin(user, packages);
                //        });
                //})
                // .then(function(){
                //     return system.localRepository
                //         .getPluginInfo({name: 'task-weather'})
                //         .then(function(buddyPackage){
                //             return insertPlugin(user, buddyPackage);
                //         });
                // })
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
                })
                // Create weather task
                .then(function(){
                    system.orm.models.Task.create({
                        module: 'task-weather:weather',
                        name: 'Weather',
                        description: 'Weather in Nancy',
                        userId: user.id,
                        options: {
                            latitude: 48.690399,
                            longitude: 6.171033,
                            city: 'Nancy'
                        },
                        triggers: [
                            {
                                type: 'manual',
                            },
                        ]
                    })
                })
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