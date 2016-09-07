"use strict";

var util = require("util");

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
                        .then(function() {
                           return system.localRepository.getPluginInfo({name: 'task-simple-message'})
                               .then(function(packages){
                                   return insertPlugin(user, packages)
                                       .then(function(plugin){
                                           return system.apiService.findModuleByName(user.id, plugin.id, "simple-message").then(function(module) {
                                               return system.apiService.findOrCreateTask(user.id, plugin.id, module.id, {name: "My task"});
                                           });
                                           // return Promise.all([
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
                                           // ]);
                                       });
                               });
                        })
                        .then(function() {
                            return system.localRepository
                                .getPluginInfo({name: 'keypress-trigger'})
                                .then(function(packages) {
                                    return insertPlugin(user, packages);
                                });
                        })
                        .then(function() {
                            return system.localRepository
                                .getPluginInfo({name: 'task-alarm-clock'})
                                .then(function(packages){
                                    return insertPlugin(user, packages)
                                        .then(function(plugin) {
                                            return system.apiService.findModuleByName(user.id, plugin.id, "alarm-clock").then(function(module) {
                                                return system.apiService.findOrCreateTask(user.id, plugin.id, module.id, {
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
                                            });
                                        });
                                });
                        })
                        .then(function() {
                            return system.localRepository
                                .getPluginInfo({name: 'task-weather'})
                                .then(function(buddyPackage){
                                    return insertPlugin(user, buddyPackage)
                                        .then(function(plugin) {
                                            return system.apiService.findModuleByName(user.id, plugin.id, "weather")
                                                .then(function(module) {
                                                    return system.apiService.findOrCreateTask(user.id, plugin.id, module.id, {
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
                                                    });
                                                });
                                        });
                                });
                        })
                        // bell plugin
                        .then(function() {
                            return system.localRepository
                                .getPluginInfo({name: 'bell'})
                                .then(function(buddyPackage){
                                    return insertPlugin(user, buddyPackage);
                                });
                        })
                        // radio plugin
                        .then(function() {
                            return system.localRepository
                                .getPluginInfo({name: 'radio'})
                                // insert plugin
                                .then(function(buddyPackage){
                                    return insertPlugin(user, buddyPackage);
                                })
                                // create task
                                .then(function(plugin) {
                                    return system.apiService.findModuleByName(user.id, plugin.id, "radio").then(function(module) {
                                        return system.apiService.findOrCreateTask(user.id, plugin.id, module.id, {name: "Radio matin"});
                                    });
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