"use strict";

var _ = require("lodash");

module.exports.bootstrap = class Bootstrap {

    bootstrap(system, done) {
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
                                system.localRepository
                                    .getPluginInfo("date-time")
                                    // insert plugin in db
                                    .then(function(info) {
                                        return system.apiService.createOrUpdatePlugin(user.id, info.id, _.merge(info, {config: info}));
                                    }),

                                // retrieve radio plugin info
                                system.localRepository
                                    .getPluginInfo("radio")
                                    // insert plugin
                                    .then(function(info){
                                        return system.apiService.createOrUpdatePlugin(user.id, info.id, _.merge(info, {config: info}));
                                    })
                            ])
                            .then(function() {

                            });
                    });
            })
            .then(function(){
                return done();
            })
            .catch(done);
    }
};