'use strict';

var async   = require('async');
var logger  = LOGGER.getLogger('SystemPersistence');
var BaseAdapter = require('../base-adapter');

/**
 * Require the user to be initialized.
 */
class SystemPersistence extends BaseAdapter{

    constructor(system, persistence){
        super(system, persistence, 'system');

        // extra storage
        this.configsStorage = this.persistence.createDataStore('configs.db');
    }

    initialize(cb){
        var self = this;
        var parent = super.initialize.bind(this);
        async.series([
            function(done){
                self.configsStorage.loadDatabase(done);
            },
        ], function(err){
            if(err){
                return cb(err);
            }
            return parent(cb);
        });
    }

    /**
     *
     */
    loadUserConfig(cb){
        var self = this;

        this.persistence.find(this.configsStorage, { userID: this.system.getCurrentUser().getId() }, function(err, row){
            if(err) return cb(err);

            if(row){
                return cb(null, row.config);
            }

            return cb(null, {});
        });
    }

    saveUserConfig(config, cb){

        if(!cb){
            cb = function(){};
        }

        var data = {
            userID: this.system.getCurrentUser().getId(),
            config: config || {}
        };

        var query = {
            userID: data.userID,
        };

        this.persistence.saveOrUpdate(this.configsStorage, data, query, cb);
    }
}

module.exports = SystemPersistence;