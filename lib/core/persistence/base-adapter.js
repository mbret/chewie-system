'use strict';

var logger = LOGGER.getLogger('BaseAdapter');
var async   = require('async');
var util = require('util');
var _ = require('lodash');

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
            //logger.debug('object [%s] saved to storage [%s]', util.inspect(newDoc), self.storageName);
            return cb(err, newDoc);
        });
    }

    fetchAll(){
        var self = this;
        return new Promise(function(resolve, reject){
            self.getStorage().find({}, function(err, docs){
                if(err){
                    return reject(err);
                }
                return resolve(docs);
            })
        });
    }

    fetchOne(id){
        var self = this;
        return new Promise(function(resolve, reject){
            var query = _.isPlainObject(id) ? id : {_id: id};
            self.getStorage().find(query, function(err, docs){
                if(err){
                    return reject(err);
                }
                return resolve(docs.length > 0 ? docs[0] : null);
            });
        });
    }
}

module.exports = BaseAdapter;