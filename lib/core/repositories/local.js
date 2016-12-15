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
var self = null;
var LocalRepository = (function (_super) {
    __extends(LocalRepository, _super);
    function LocalRepository(system) {
        _super.call(this, system, system.logger.Logger.getLogger('LocalRepository'));
        self = this;
        this.localPath = system.config.pluginsLocalRepositoryDir;
    }
    LocalRepository.prototype.getPluginsInfo = function () {
        return new Promise(function (resolve, reject) {
            self.getPluginDirs(function (err, dirs) {
                if (err) {
                    return reject(err);
                }
                var pluginsInfo = [];
                async.each(dirs, function (dir, cb) {
                    self.readPlugin(dir, function (err, info) {
                        if (err) {
                            self.logger.debug("The module at " + dir + " has been ignored because of error on load", err.message);
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
    LocalRepository.prototype.getPluginInfo = function (name) {
        return new Promise(function (resolve, reject) {
            var pluginDir = self.getPluginDir(name);
            self.pluginExist(pluginDir)
                .then(function (exist) {
                if (!exist) {
                    return resolve(null);
                }
                return self.readPlugin(pluginDir, function (err, info) {
                    if (err) {
                        self.logger.debug("The plugin %s is impossible to read. It either does not exist or is invalid. Err: %s", name, err.message);
                        return resolve(null);
                    }
                    return resolve(info);
                });
            })
                .catch(reject);
        });
    };
    LocalRepository.prototype.getPluginDirs = function (cb) {
        var dirs = [];
        async.each([this.localPath], function (dir, done) {
            fs.readdir(dir, function (err, files) {
                if (err) {
                    return done(err);
                }
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
    LocalRepository.prototype.getPluginDir = function (name) {
        return path.join(this.localPath, name);
    };
    LocalRepository.prototype.pluginExist = function (dir) {
        return new Promise(function (resolve, reject) {
            var stats = null;
            try {
                stats = fs.lstatSync(dir);
            }
            catch (err) {
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
    };
    LocalRepository.prototype.readPlugin = function (dirpath, cb) {
        var moduleInfo = null;
        try {
            delete require.cache[require.resolve(path.join(dirpath, 'plugin-package.js'))];
            moduleInfo = require(path.join(dirpath, 'plugin-package.js'));
        }
        catch (err) {
            if (err.code === "MODULE_NOT_FOUND") {
                return cb(new Error("Not a valid module and is invalid to load. err: " + err.code));
            }
            return cb(err);
        }
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
