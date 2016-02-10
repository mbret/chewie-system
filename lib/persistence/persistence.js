'use strict';

var Datastore = require('nedb');
var _       = require('lodash');
var path    = require('path');
var logger  = LOGGER.getLogger('Persistence');
var async   = require('async');
var PluginsPersistence = require('./plugins-persistence.js');

/**
 * Notes:
 *  - The db is automatically compacted (one line) at startup.
 *  - When updated, one line is inserted
 */
class Persistence{

    constructor(config){
        var self = this;
        this.config = config;
        this.storagePath = path.join(self.config.appPath, this.config.persistancePath);
        this.db     = new Datastore({ filename: path.join(this.storagePath, self.config.databasePath) });
        this.taskDb = new Datastore({ filename: path.join(this.storagePath, self.config.taskDatabase) });
        //this.messagesAdaptersDb = new Datastore({ filename: path.join(storagePath, self.config.messagesAdaptersDb) });
        this.notificationsDb = new Datastore({ filename: path.join(this.storagePath, self.config.notificationsDb) });

        this.plugins = new PluginsPersistence(this);
    }

    /**
     *
     * @param cb
     */
    initialize(cb){

        var self = this;
        async.series([

            function(done){
                self.db.loadDatabase(done);
            },

            function(done){
                self.taskDb.loadDatabase(done);
            },

            //function(done){
            //    self.messagesAdaptersDb.loadDatabase(done);
            //},

            function(done){
                self.notificationsDb.loadDatabase(done);
            },

            function(done){
                self.plugins.initialize(done);
            }

        ], function(err){
            if(!err){
                logger.verbose('Initialized');
            }
            return cb(err);
        });
    }

    createDataStore(name){
        return new Datastore({ filename: path.join(this.storagePath, name) });
    }

    /**
     * Return a list of tasks with their modules. { module: .., task: .. }
     * @param cb
     */
    getTasks(cb){
        var self = this;
        self.taskDb.find({}, function(err, docs){
            return cb(err, docs);
        });
    }

    /**
     * Return a list of task for the given module
     * @param moduleName
     * @param cb
     */
    getTasksByModule(moduleName, cb){
        // ...
    }

    /**
     *
     * @param task
     * @param moduleName
     * @param cb
     */
    saveTask(task, cb){
        var self = this;
        self.taskDb.insert(task.toDb(), function(err){
            if(err){
                logger.error('Unable to save task in db', task.toDb());
            }
            else{
                logger.verbose('Task saved', task.toDb());
            }
            return cb(err);
        })
    }

    saveNotif(notification, cb){
        notification.createdAt = new Date();
        this.notificationsDb.insert(notification, function(err){
            if(cb){
                cb(err);
            }
        });
    }

    /**
     *
     * @param id
     * @param data
     * @param cb
     */
    //saveOrUpdateMessageAdapter(id, data, cb){
    //    this.saveOrUpdate(this.messagesAdaptersDb, data, { id: id }, cb);
    //}

    //getMessageAdapter(id, cb){
    //    this.get(this.messagesAdaptersDb, {id : id}, cb);
    //}

    /**
     *
     * @param db
     * @param data
     * @param query
     * @param cb
     */
    saveOrUpdate(db, data, query, cb){
        db.update(query, data, { upsert: true }, function (err, numReplaced, upsert) {
            if(err){
                logger.error(err);
            }
            return cb(err, numReplaced, upsert);
        });
    }

    get(db, query, cb){
        db.findOne(query, function(err, entries){
            return cb(err, entries);
        });
    }
}

module.exports = Persistence;