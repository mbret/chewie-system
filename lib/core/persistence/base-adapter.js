'use strict';

var logger = LOGGER.getLogger('BaseAdapter');
var async   = require('async');

class BaseAdapter{

    constructor(persistence, storageName){
        this.persistence = persistence;
        this.storageName = storageName;
        this.db = null;
        if(storageName){
            this.setDb(this.persistence.createDataStore(storageName + '.db'));
        }
    }

    initialize(cb){
        var self = this;
        async.series([
            function(done){
                self.getStorage().loadDatabase(done);
            },
        ], function(err){
            if(!err){
                logger.debug(self.storageName + '.db initialized');
            }
            return cb(err);
        });
    }

    setDb(db){
        this.db = db;
    }

    getStorage(){
        return this.db;
    }

    save(object, cb){

        if(!cb){
            cb = function(){};
        }

        object.createdAt = new Date();

        this.getStorage().insert(object, function(err){
            if(err){
                logger.error(err);
            }
            return cb(err);
        });
    }
}

module.exports = BaseAdapter;