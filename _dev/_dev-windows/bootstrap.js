"use strict";

module.exports = function(system, logger, done){

    // create new user
    system.apiService
        .findOrCreateUser({ username: "mbret" })
        .then(function() {
            // retrieve user info
            return system.apiService.findUserByUsername("admin")
                .then(function(user) {
                    return Promise
                        .all([
                            // retrieve date & time plugin info
                            system.localRepository.getPluginInfo("date-time")
                                .then(function(info) {
                                    // insert plugin in db
                                    return system.apiService.createOrUpdatePlugin(user.id, info.id, info);
                                }),

                            // retrieve radio plugin info
                            system.localRepository.getPluginInfo("radio")
                                // insert plugin
                                .then(function(info){
                                    return system.apiService.createOrUpdatePlugin(user.id, info.id, info);
                                })
                                .then(function(plugin) {
                                    // create task
                                    // return system.apiService.findModuleByName(user.id, plugin.id, "radio").then(function(module) {
                                    //     return system.apiService.updateOrCreateTask(user.id, plugin.id, module.id,
                                    //         {
                                    //             name: "Radio matin",
                                    //             options: {
                                    //                 radioName: "nrj"
                                    //             }
                                    //         });
                                    // });
                                })
                        ])
                        .then(function() {

                        });
                });
        })
        .then(function(){
            return done();
        })
        .catch(function(err){
            return done(err);
        });
};