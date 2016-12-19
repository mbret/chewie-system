'use strict';

let _ = require('lodash');
let fs = require('fs');
let path = require('path');
import BaseRepository = require("./base");
import * as async from "async";
let self = null;

export default class LocalRepository extends BaseRepository {

    localPath: string;

    constructor(system){
        super(system, system.logger.Logger.getLogger('LocalRepository'));
        self = this;
        // @odo remove, use one path for now
        this.localPath = system.config.pluginsLocalRepositoryDir;
    }

    /**
     *
     * @returns {Promise}
     */
    public getPluginsInfo() {
        return new Promise(function(resolve, reject) {
            self.getPluginDirs(function(err, dirs) {
                if (err) {
                    return reject(err);
                }

                var pluginsInfo = [];
                async.each(dirs, function(dir, cb) {
                    self.readPlugin(dir, function(err, info) {
                        if (err) {
                            // just ignore the module if it is on error
                            self.logger.debug("The module at " + dir + " has been ignored because of error on load", err.message);
                            return cb(null);
                        }
                        pluginsInfo.push(info);
                        return cb();
                    });
                }, function(err) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(pluginsInfo);
                });
            });
        });
    }

    /**
     * Load a plugin package from local repository.
     * @param {string} name
     * name: name of package to get info
     * @returns {Promise}
     */
    getPluginInfo(name) {
        return new Promise(function(resolve, reject){
            let pluginDir = self.getPluginDir(name);
            self.pluginExist(pluginDir)
                .then(function(exist) {
                    if (!exist) {
                        return resolve(null);
                    }
                    return self.readPlugin(pluginDir, function(err, info) {
                        if (err) {
                            self.logger.debug("The plugin %s is impossible to read. It either does not exist or is invalid. Err: %s", name, err.message);
                            return resolve(null);
                        }
                        return resolve(info);
                    });
                })
                .catch(reject);
        });
    }

    /**
     *
     * @param cb
     */
    getPluginDirs(cb){
        var dirs = [];
        // @todo remove array
        async.each([this.localPath], function(dir, done){

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
     */
    getPluginDir(name){
        return path.join(this.localPath, name);
    }

    pluginExist(dir) {
        return new Promise(function(resolve, reject) {
            let stats = null;
            try {
                stats = fs.lstatSync(dir);
            } catch (err) {
                if (err.code === "ENOENT") {
                    return resolve(false);
                }
                return reject(err);
            }
            if (stats.isDirectory()) {
                return resolve(true);
            }
            return resolve(false);
        });
    }

    private readPlugin(dirpath, cb){
        var moduleInfo = null;
        try {
            // invalidate cache. We need this to ensure always having fresh info instead of the same "moduleInfo" var which may be changed further.
            // also the plugin may be changed during runtime this way.
            delete require.cache[require.resolve(path.join(dirpath, 'plugin-package.js'))];
            moduleInfo = require(path.join(dirpath, 'plugin-package.js'));
        } catch (err) {
            if (err.code === "MODULE_NOT_FOUND") {
                return cb(new Error("Not a valid module and is invalid to load. err: " + err.code));
            }
            return cb(err);
        }
        // check module
        if (!moduleInfo.name) {
            return cb(new Error("No name specified"));
        }
        if (!moduleInfo.author) {
            return cb(new Error("No author specified"));
        }
        if (!moduleInfo.version) {
            return cb(new Error("No version specified"));
        }
        return cb(null, moduleInfo);
    }
}