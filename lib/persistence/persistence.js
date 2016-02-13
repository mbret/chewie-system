'use strict';

var Datastore = require('nedb');
var _       = require('lodash');
var path    = require('path');
var logger  = LOGGER.getLogger('Persistence');
var async   = require('async');
var PluginsPersistence = require('./plugins-persistence.js');
var UsersPersistence = require('./users-persistence.js');
var SystemPersistence = require('./system-persistence.js');

/**
 * Notes:
 *  - The db is automatically compacted (one line) at startup.
 *  - When updated, one line is inserted
 */
class Persistence{

    constructor(config){
        var self = this;
        this.config = config;
        this.storagePath = this.config.persistenceDir;
        console.log(this.storagePath);
        this.db     = new Datastore({ filename: path.join(this.storagePath, 'db.db') });
        this.taskDb = new Datastore({ filename: path.join(this.storagePath, 'tasks.db') });
        //this.messagesAdaptersDb = new Datastore({ filename: path.join(storagePath, self.config.messagesAdaptersDb) });
        this.notificationsDb = new Datastore({ filename: path.join(this.storagePath, 'notifications.db') });

        // Import adapters
        this.plugins    = new PluginsPersistence(this);
        this.users      = new UsersPersistence(this);
        this.system     = new SystemPersistence(this);
    }

    /**
     *
     * @param cb
     */
    initialize(cb){

        var self = this;
        async.series([

            self.db.loadDatabase.bind(self.db),
            self.taskDb.loadDatabase.bind(self.taskDb),
            self.notificationsDb.loadDatabase.bind(self.notificationsDb),

            // Initialize imported stores
            self.plugins.initialize.bind(self.plugins),
            self.users.initialize.bind(self.users),
            self.system.initialize.bind(self.system),

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

    find(db, query, cb){
        return this.get(db, query, cb);
    }

    get(db, query, cb){
        db.findOne(query, function(err, entries){
            return cb(err, entries);
        });
    }

    createOrUpdate(db, data, query, cb){
        return this.saveOrUpdate(db, data, query, cb);
    }
}

module.exports = Persistence;