"use strict";

var _ = require("lodash");

module.exports.bootstrap = class Bootstrap {

    bootstrap(system, done) {

        return done();
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
                                    // insert plugin in db
                                    .then(function(info) {
                                        if (!info) {
                                            throw new Error("date-time does not exist");
                                        }
                                        var data = _.merge({id: info.name}, info, {config: info});
                                        return system.apiService.createOrUpdatePlugin(user.id, data.id, data);
                                    }),

                                // retrieve radio plugin info
                                system.localRepository.getPluginInfo("radio-web")
                                    // insert plugin
                                    .then(function(info){
                                        if (!info) {
                                            throw new Error("radio-web does not exist");
                                        }
                                        var data = _.merge({id: info.name}, info, {config: info});
                                        return system.apiService.createOrUpdatePlugin(user.id, data.id, data);
                                    })
                            ]);
                    });
            })
            .then(function(){
                return done();
            })
            .catch(done);
    }
};