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

    /**
     * Load a plugin package from local repository.
     * @param options
     * name: name of package to get info
     * @returns {Promise}
     */
    getPluginInfo(options){
        options = _.merge({name: null, version: null}, options);
        var self = this;

        return new Promise(function(resolve, reject){
            self.getPluginDir(options.name, function(err, dir){
                if(err){
                    return reject(err);
                }

                if(dir !== null){
                    return self._readPlugin(dir, function(err, packageJson, buddyPackage){
                        if(err){
                            return reject(err);
                        }
                        return resolve({
                            modulePackage: packageJson,
                            pluginPackage: buddyPackage
                        });
                    });
                }

                return resolve(null);
            });
        });
    }

    /**
     *
     * @param cb
     */
    getPluginDirs(cb){
        var dirs = [];
        async.each(this.localPaths, function(dir, done){

            // Read current plugin dir
            fs.readdir(dir, function(err, files){
                if(err){
                    return done(err);
                }

                // loop over all dirs
                async.each(files, function(file, callback){
                    var myFile = path.resolve(dir, file);
                    fs.stat(myFile, function(err, stat){
                        if(err){
                            return callback(err);
                        }
                        if(stat.isDirectory()){
                            dirs.push(myFile);
                        }
                        return callback();
                    })
                }, function(err){
                    return done(err);
                });

            });
        }, function(err){
            if(err){
                return cb(err);
            }
            return cb(null, dirs);
        });
    }

    /**
     * Return the module directory for the plugin name.
     * Something like ../plugins/my-plugin
     * @param name
     * @param cb
     */
    getPluginDir(name, cb){
        this.getPluginDirs(function(err, dirs){
            if(err){
                return cb(err);
            }

            var found = null;
            _.forEach(dirs, function(dir){
                if(path.basename(dir) === name){
                    found = dir;
                }
            });

            return cb(null, found);
        });
    }

    _readPlugin(dirpath, cb){
        try {
            return cb(null, require(path.resolve(dirpath, 'package.json')), require(path.resolve(dirpath, 'plugin-package.js')));
        } catch (err) {
            if (err.code === "MODULE_NOT_FOUND") {
                return cb(new Error("The module " + dirpath + " does not seems to be a valid module and is invalid to load. Please check that the module contain package.json and plugin-package.js. \n" + err.stack));
            }
            return cb(err);
        }
    }
}

module.exports = LocalRepository;