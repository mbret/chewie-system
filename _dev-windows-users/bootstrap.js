"use strict";

module.exports = function(system, logger, done){

    system.apiService
        // Create user "maxime"
        .post("/users", {
            username: "mbret",
            lastName: "Bret",
            firstName: "Maxime"

        })
        .then(function(response) {
            console.log(response.statusCode);
            return done();
        })
        .catch(done);
};