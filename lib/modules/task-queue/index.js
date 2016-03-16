'use strict';

var async = require('async');
var _ = require('lodash');

function TaskQueue(){
    this.tasks = {};
}

TaskQueue.prototype.register = function (key, fn){
    if(!this.tasks[key]){
        this.tasks[key] = [];
    }
    this.tasks[key].push(fn);
};

TaskQueue.prototype.proceedAll = function(options, done){

};

TaskQueue.prototype.proceed = function(key, options, done){

    done = done || function(){};

    options = _.merge({
        serie: false,
        stopOnError: false,
        taskTimeout: null, // @todo
    }, options);

    var errors = [];

    var method = options.serie ? async.eachSeries : async.each;

    method(this.tasks[key], function(fn, cb2){
        fn(function(err){
            if(err){
                if(options.stopOnError === true){
                    return cb2(err);
                }
                errors.push(err);
            }
            return cb2();
        })
    }, function(err){
        // we have errors in stack
        // we need to build specific error
        if(errors.length > 0){
            err = new Error('Errors');
            err.errors = errors;
        }
        return done(err);
    });

};

module.exports = exports = new TaskQueue();