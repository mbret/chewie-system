"use strict";

module.exports = function(system, logger, done){

    system.apiService
        // Create user "maxime"
        .post("/users", {
            username: "mbret"
        })
        .then(function() {
            return done();
        })
        .catch(done);
};