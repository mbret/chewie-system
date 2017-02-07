'use strict';
let _ = require('lodash');
let fs = require('fs');
let path = require('path');
const BaseRepository = require("./base");
const async = require("async");
let self = null;
class LocalRepository extends BaseRepository {
    constructor(system) {
        super(system, system.logger.getLogger('LocalRepository'));
        self = this;
        this.localPath = system.config.pluginsLocalRepositoryDir;
    }
    getPluginsInfo() {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.getPluginDirs(function (err, dirs) {
                if (err) {
                    return reject(err);
                }
                let pluginsInfo = [];
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
    }
    getPluginInfo(name) {
        let self = this;
        return new Promise(function (resolve, reject) {
            let pluginDir = self.getPluginDir(name);
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
    }
    getPluginDirs(cb) {
        let dirs = [];
        async.each([this.localPath], function (dir, done) {
            fs.readdir(dir, function (err, files) {
                if (err) {
                    return done(err);
                }
                async.each(files, function (file, callback) {
                    let myFile = path.resolve(dir, file);
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
    }
    getPluginDir(name) {
        return path.join(this.localPath, name);
    }
    readPlugin(dirpath, cb) {
        let self = this;
        let moduleInfo = null;
        let moduleDirFullPath = path.resolve(dirpath);
        try {
            delete require.cache[require.resolve(path.join(moduleDirFullPath, LocalRepository.PACKAGE_FILE_NAME))];
        }
        catch (err) { }
        try {
            delete require.cache[require.resolve(path.join(moduleDirFullPath, LocalRepository.PACKAGE_FILE_NAME_JSON))];
        }
        catch (err) { }
        try {
            moduleInfo = this.loadPackageFile(moduleDirFullPath);
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
    }
    loadPackageFile(moduleDirFullPath) {
        try {
            return require(path.join(moduleDirFullPath, LocalRepository.PACKAGE_FILE_NAME));
        }
        catch (err) {
            if (err.code === "MODULE_NOT_FOUND") {
                return require(path.join(moduleDirFullPath, LocalRepository.PACKAGE_FILE_NAME_JSON));
            }
            else {
                throw err;
            }
        }
    }
}
LocalRepository.PACKAGE_FILE_NAME = "chewie.package.js";
LocalRepository.PACKAGE_FILE_NAME_JSON = "chewie.package.json";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LocalRepository;
//# sourceMappingURL=local.js.map