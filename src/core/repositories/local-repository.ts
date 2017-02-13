'use strict';

let _ = require('lodash');
let fs = require('fs');
let path = require('path');
import BaseRepository = require("./base");
import * as async from "async";
import {debug} from "../../shared/debug";
import {PluginsLoader} from "../plugins/plugins-loader";
let self = null;

export default class LocalRepository extends BaseRepository {

    localPath: string;

    constructor(system){
        super(system, system.logger.getLogger('LocalRepository'));
        self = this;
        // @todo remove, use one path for now
        this.localPath = system.config.pluginsLocalRepositoryDir;
    }

    /**
     *
     * @returns {Promise}
     */
    public fetchAllPluginsPackageInfo() {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.getPluginDirs(function(err, dirs) {
                if (err) {
                    return reject(err);
                }

                let pluginsInfo = [];
                async.each(dirs, function(dir, cb) {
                    self.readPlugin(dir, function(err, info) {
                        if (err) {
                            // just ignore the module if it is on error
                            debug("repositories:local")("The module at %s has been ignored because of error (%s) on load", dir, err.message);
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
        let self = this;
        return new Promise(function(resolve, reject){
            let pluginDir = self.getPluginDir(name);
            self.system.repository.pluginExistByDir(pluginDir)
                .then(function(exist) {
                    if (!exist) {
                        return resolve(null);
                    }
                    return self.readPlugin(pluginDir, function(err, info) {
                        if (err) {
                            self.logger.debug("The plugin %s in %s is impossible to read. It either does not exist or is invalid. Err: %s", name, path.resolve(pluginDir), err.message);
                            return resolve(null);
                        }
                        return resolve(info);
                    });
                })
                .catch(reject);
        });
    }

    /**
     * @param cb
     */
    getPluginDirs(cb){
        let dirs = [];
        // @todo remove array
        async.each([this.localPath], function(dir, done){

            // Read current plugin dir
            fs.readdir(dir, function(err, files){
                if(err){
                    return done(err);
                }

                // loop over all dirs
                async.each(files, function(file, callback){
                    let myFile = path.resolve(dir, file);
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

    /**
     *
     * @param dirPath
     * @param cb
     * @returns {any}
     */
    private readPlugin(dirPath, cb) {
        let self = this;
        let moduleInfo = null;
        let pluginsLoader = new PluginsLoader(this.system);
        // we need to use full path because require is a bit different with relative path like "./../foo"
        let moduleDirFullPath = path.resolve(dirPath);
        try {
            moduleInfo = pluginsLoader.loadPackageFile(moduleDirFullPath);
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