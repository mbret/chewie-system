'use strict';

let requireAll = require('require-all');
let system = require("../../lib/index");
let path = require("path");
let _ = require("lodash");

// Ensure we're in the project directory, so cwd-relative paths work as expected
// no matter where we actually start from.
// process.chdir(__dirname);

// Load custom config
// var config = {};
// requireAll({
//     dirname     : path.join(__dirname, "config"),
//     recursive   : true,
//     resolve     : function(conf){
//         config = _.merge(config, conf);
//     }
// });

before(function(done) {
    // Start the system
    // You don't need anything else after this point.
    // The system handle itself completely.
    system.start({
        log: {
            level: "info"
        },
        database: {
            connexion: {
                dropOnStartup: true
            }
        },
    }, function(err){
        if (err) {
            return done(err);
        }
        done();
    });
});

after(function(done) {
    system.shutdown(function(){
        done();
    });
});

exports.system = system;