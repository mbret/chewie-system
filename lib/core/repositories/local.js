'use strict';
var Repository = require('./base');
var requireAll = require('require-all');
var _ = require('lodash');
var walk = require('walk');
var fs = require('fs');
var path = require('path');
var async = require('async');

class LocalRepository extends Repository{

    constructor(system){
        super(system);

        this.localPaths = system.getConfig().plugins.localRepositories;
    }

    readPluginInfo(options){
        options = _.merge({name: null, version: null}, options);
        var self = this;

        return new Promise(function(resolve, reject){
            var found = null;
            async.each(self.localPaths, function(dir, cb){

                    // Read current dir
                    fs.readdir(dir, function(err, files){
                        if(err){
                            return cb(err);
                        }
                        async.each(files, function(file, callback){
                           var myFile = path.resolve(dir, file);
                           fs.stat(myFile, function(err, stat){
                               if(err){
                                   return callback(err);
                               }
                               if(stat.isDirectory() && (file === options.name)){
                                   found = myFile;
                               }
                               return callback();
                           })
                        }, function(err){
                            return cb(err);
                        });

                    });
            }, function(err){
                if(err){
                    console.error(err);
                }
                if(found !== null){
                    return self._readPlugin(found, function(err, packageJson, buddyPackage){
                        if(err){
                            console.error(err);
                            return resolve();
                        }
                        return resolve([packageJson, buddyPackage]);
                    });
                }
                return resolve(null);
            });
        });
    }

    _readPlugin(dirpath, cb){
        return cb(null, require(path.resolve(dirpath, 'package.json')), require(path.resolve(dirpath, 'plugin-package.js')));
    }
}

module.exports = LocalRepository;