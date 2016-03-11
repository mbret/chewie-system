'use strict';

var mkdirp = require('mkdirp');
var _ = require('lodash');
var async = require('async');

class Utils{

    static initDirsSync(dirs){
        dirs.forEach(function(dir){
            mkdirp.sync(dir);
        });
    }

    static initDirs(dirs, cb){
        async.each(dirs, function(dir, done){
            mkdirp(dir, done);
        }, cb);
    }
}

module.exports = Utils;