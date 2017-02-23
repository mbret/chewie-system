'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var BaseRepository = require("./base");
var async = require("async");
var debug_1 = require("../../shared/debug");
var plugins_loader_1 = require("../plugins/plugins-loader");
var self = null;
var LocalRepository = (function (_super) {
    __extends(LocalRepository, _super);
    function LocalRepository(system) {
        var _this = _super.call(this, system, system.logger.getLogger('LocalRepository')) || this;
        self = _this;
        // @todo remove, use one path for now
        _this.localPath = system.config.pluginsLocalRepositoryDir;
        return _this;
    }
    /**
     *
     * @returns {Promise}
     */
    LocalRepository.prototype.fetchAllPluginsPackageInfo = function () {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.getPluginDirs(function (err, dirs) {
                if (err) {
                    return reject(err);
                }
                var pluginsInfo = [];
                async.each(dirs, function (dir, cb) {
                    self.readPlugin(dir, function (err, info) {
                        if (err) {
                            // just ignore the module if it is on error
                            debug_1.debug("repositories:local")("The module at %s has been ignored because of error (%s) on load", dir, err.message);
                            return cb(null);
                        }
                        pluginsInfo.push(info);
                        return cb();
                    });
                }, function (err) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(pluginsInfo);
                });
            });
        });
    };
    /**
     * Load a plugin package from local repository.
     * @param {string} name
     * name: name of package to get info
     * @returns {Promise}
     */
    LocalRepository.prototype.getPluginInfo = function (name) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var pluginDir = self.getPluginDir(name);
            self.system.repository.pluginExistByDir(pluginDir)
                .then(function (exist) {
                if (!exist) {
                    return resolve(null);
                }
                return self.readPlugin(pluginDir, function (err, info) {
                    if (err) {
                        self.logger.debug("The plugin %s in %s is impossible to read. It either does not exist or is invalid. Err: %s", name, path.resolve(pluginDir), err.message);
                        return resolve(null);
                    }
                    return resolve(info);
                });
            })
                .catch(reject);
        });
    };
    /**
     * @param cb
     */
    LocalRepository.prototype.getPluginDirs = function (cb) {
        var dirs = [];
        // @todo remove array
        async.each([this.localPath], function (dir, done) {
            // Read current plugin dir
            fs.readdir(dir, function (err, files) {
                if (err) {
                    return done(err);
                }
                // loop over all dirs
                async.each(files, function (file, callback) {
                    var myFile = path.resolve(dir, file);
                    fs.stat(myFile, function (err, stat) {
                        if (err) {
                            return callback(err);
                        }
                        if (stat.isDirectory()) {
                            dirs.push(myFile);
                        }
                        return callback();
                    });
                }, function (err) {
                    return done(err);
                });
            });
        }, function (err) {
            if (err) {
                return cb(err);
            }
            return cb(null, dirs);
        });
    };
    /**
     * Return the module directory for the plugin name.
     * Something like ../plugins/my-plugin
     * @param name
     */
    LocalRepository.prototype.getPluginDir = function (name) {
        return path.join(this.localPath, name);
    };
    /**
     *
     * @param dirPath
     * @param cb
     * @returns {any}
     */
    LocalRepository.prototype.readPlugin = function (dirPath, cb) {
        var self = this;
        var moduleInfo = null;
        var pluginsLoader = new plugins_loader_1.PluginsLoader(this.system);
        // we need to use full path because require is a bit different with relative path like "./../foo"
        var moduleDirFullPath = path.resolve(dirPath);
        try {
            moduleInfo = pluginsLoader.loadPackageFile(moduleDirFullPath);
        }
        catch (err) {
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
    };
    return LocalRepository;
}(BaseRepository));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LocalRepository;
