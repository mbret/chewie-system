"use strict";

module.exports = function(system, logger, done){

    // create new user
    system.apiService
        .createUser({
            username: "mbret"
        })
        .then(function() {
            return system.apiService.findUserByUsername("admin")
                .then(function(user) {
                    return system.localRepository
                        .getPluginInfo({name: 'task-simple-message'})
                        .then(function(packages){
                            insertPlugin(user, packages)
                                .then(function(plugin){
                                    return Promise.all([
                                        //system.orm.models.Task.create({
                                        //    module: plugins[0].get('name') + ':simple-message',
                                        //    name: 'task 1',
                                        //    options: { foo: 'bar' },
                                        //    userId: user.id,
                                        //    triggers: [
                                        //        {
                                        //            type: 'manual',
                                        //            options: { text: 'coucou' },
                                        //            outputAdapters: ['voxygen', 'console']
                                        //        },
                                        //        {
                                        //            type: 'schedule',
                                        //            options: {'taskOptions.option1': 'coucou'},
                                        //            schedule: {
                                        //                method: 'moment',
                                        //                hour: 12,
                                        //                minute: 27
                                        //            }
                                        //        }
                                        //    ]
                                        //}),
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
                        .then(function(){
                            return system.localRepository
                                .getPluginInfo({name: 'task-alarm-clock'})
                                .then(function(packages){
                                    return insertPlugin(user, packages)
                                        .then(function(plugin) {
                                            return system.apiService.createTask(user.id, plugin.id, "alarm-clock", {
                                                name: 'Reveil',
                                                description: 'Reveil matin',
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
                                                        options: { action: 'stop' }
                                                    },
                                                    {
                                                        type: 'manual',
                                                        options: { action: 'start', repeat: true }
                                                    }
                                                ]
                                            });
                                        })
                                });
                        })
                        .then(function(){
                            return system.localRepository
                                .getPluginInfo({name: 'task-weather'})
                                .then(function(buddyPackage){
                                    return insertPlugin(user, buddyPackage)
                                        .then(function(plugin) {
                                            // Create weather task
                                            return system.apiService.createTask(user.id, plugin.id, "weather", {
                                                name: 'Weather',
                                                description: 'Weather in Nancy',
                                                options: {
                                                    latitude: 48.690399,
                                                    longitude: 6.171033,
                                                    city: 'Nancy'
                                                },
                                                triggers: [
                                                    {
                                                        type: 'manual'
                                                    }
                                                ]
                                            })
                                        });
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


                            ]);
                        })

                })
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
        return system.apiService
            .findOrCreatePlugin(user.id, packageJson.name, {
                modulePackage: packageJson,
                pluginPackage: pluginPackage,
                version: packageJson.version,
                description: packageJson.description,
                name: packageJson.name
            })
    }
};