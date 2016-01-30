'use strict';

var Datastore = require('nedb');
var _       = require('lodash');
var path    = require('path');
var logger  = LOGGER.getLogger('Database');
var async   = require('async');

/**
 * Notes:
 *  - The db is automatically compacted (one line) at startup.
 *  - When updated, one line is inserted
 */
class Module{

    constructor(config){
        var self = this;
        this.config = config;
        var storagePath = path.join(self.config.appPath, this.config.persistancePath);
        this.db     = new Datastore({ filename: path.join(storagePath, self.config.databasePath) });
        this.taskDb = new Datastore({ filename: path.join(storagePath, self.config.taskDatabase) });
        //this.messagesAdaptersDb = new Datastore({ filename: path.join(storagePath, self.config.messagesAdaptersDb) });
        this.notificationsDb = new Datastore({ filename: path.join(storagePath, self.config.notificationsDb) });
        this.pluginsUserOptionsDb = new Datastore({ filename: path.join(storagePath, 'pluginsUserOptions.db') });
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
                self.pluginsUserOptionsDb.loadDatabase(done);
            }

        ], function(err){
            if(!err){
                logger.verbose('Initialized');
            }
            return cb(err);
        });
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

    getMessageAdapter(id, cb){
        this.get(this.messagesAdaptersDb, {id : id}, cb);
    }

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

module.exports = Module;