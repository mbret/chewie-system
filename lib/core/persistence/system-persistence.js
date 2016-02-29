'use strict';

var async   = require('async');
var logger  = LOGGER.getLogger('SystemPersistence');

class SystemPersistence{

    constructor(persistence){
        this.persistence = persistence;
        this.db = this.persistence.createDataStore('system.db');
    }

    initialize(cb){

        var self = this;
        async.series([

            function(done){
                self.db.loadDatabase(done);
            },

        ], function(err){
            if(!err){
                logger.debug('Initialized');
            }
            return cb(err);
        });
    }

    /**
     *
     */
    loadConfigOrCreate(cb){
        var self = this;

        this.persistence.find(this.db, { _id: 'systemConfig' }, function(err, row){
            if(err) return cb(err);

            if(row){
                delete row._id;
                return cb(null, row);
            }

            logger.info('No config found yet. Creating default...');
            self.persistence.createOrUpdate(self.db, { _id: 'systemConfig' }, {}, function(err, row, inserted){
                if(err) return cb(err);

                delete inserted._id;
                return cb(null, inserted);
            });
        });
    }

    saveConfig(data, cb){
        if(!cb){
            cb = function(){};
        }

        var query = {
            _id: 'systemConfig',
        };

        this.persistence.saveOrUpdate(this.db, data, query, cb);
    }
}

module.exports = SystemPersistence;