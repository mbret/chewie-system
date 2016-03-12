'use strict';

var logger = LOGGER.getLogger('BaseAdapter');
var async   = require('async');
var util = require('util');

class BaseAdapter{

    constructor(system, persistence, storageName){
        this.system = system;
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

        var self = this;

        if(!cb){
            cb = function(){};
        }

        object.createdAt = new Date();

        this.getStorage().insert(object, function(err, newDoc){
            if(err){
                logger.error(err);
            }
            logger.debug('object [%s] saved to storage [%s]', util.inspect(newDoc), self.storageName);
            return cb(err, newDoc);
        });
    }
}

module.exports = BaseAdapter;