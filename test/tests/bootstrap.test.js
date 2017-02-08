'use strict';

// Ensure we're in the project directory, so cwd-relative paths work as expected
// no matter where we actually start from.
// process.chdir(__dirname + "/../_test-app-base");

// let system = require("../../");
// let path = require("path");
// let _ = require("lodash");

before(function(done) {
    // Start the system
    // You don't need anything else after this point.
    // The system handle itself completely.
    // system.start({
    //     settings: {
    //         log: {
    //             level: "info"
    //         }
    //     }
    // }, function(err){
    //     if (err) {
    //         return done(err);
    //     }
    //     done();
    // });
    done();
});

after(function(done) {
    // system.shutdown(function(){
    //     done();
    // });
    done();
});

// exports.system = system;