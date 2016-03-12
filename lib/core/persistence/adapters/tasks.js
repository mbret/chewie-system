'use strict';

var BaseAdapter = require('../base-adapter');
var logger = LOGGER.getLogger('BaseAdapter');
var util = require('util');

class TasksAdapter extends BaseAdapter {

    constructor(system, persistence){
        super(system, persistence, 'tasks');
    }

    save(object, cb){
        var self = this;
        super.save(object, function(err, newDoc){
            if(newDoc){
                logger.verbose('tasks [%s] saved to storage [%s]', util.inspect(newDoc, {depth: null}), self.storageName);
            }
            return cb(err, newDoc);
        });
    }
}

module.exports = TasksAdapter;