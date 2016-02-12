'use strict';

var async   = require('async');
var logger  = LOGGER.getLogger('UsersPersistence');

class UsersPersistence{

    constructor(persistence){
        this.persistence = persistence;
        this.db = this.persistence.createDataStore('config.db');
    }

    initialize(cb){

        var self = this;
        async.series([

            function(done){
                self.db.loadDatabase(done);
            },

        ], function(err){
            if(!err){
                logger.verbose('Initialized');
            }
            return cb(err);
        });
    }
}

module.exports = UsersPersistence;