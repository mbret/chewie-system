'use strict';

var Datastore = require('nedb');
var _       = require('lodash');
var logger  = LOGGER.getLogger('Persistence');
var async   = require('async');
var path = require('path');

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
        this.db     = new Datastore({ filename: path.join(this.storagePath, 'db.db') });
        this.taskDb = new Datastore({ filename: path.join(this.storagePath, 'tasks.db') });
        //this.messagesAdaptersDb = new Datastore({ filename: path.join(storagePath, self.config.messagesAdaptersDb) });

        // Import adapters
        this.adapters = {};
        require(MODULES_DIR + '/require-all')({
            dirname: __dirname + '/adapters',
            resolve: function(module, filename){
                console.log(module, path.basename(filename, '.js'));
                self.adapters[path.basename(filename, '.js')] = new module(self);
            }
        });
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

            // Initialize imported stores
            function(done){
                async.each(self.adapters, function(adapter, cb){
                    adapter.initialize(cb);
                }, done);
            },

        ], function(err){
            if(!err){
                logger.verbose('Initialized');
            }
            return cb(err);
        });
    }

    getAdapter(key){
        return this.adapters[key];
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

    /**
     *
     * @param db
     * @param data
     * @param query
     * @param cb
     */
    saveOrUpdate(db, data, query, cb){
        console.log(data, query);
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