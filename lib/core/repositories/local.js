'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require('lodash');
var walk = require('walk');
var fs = require('fs');
var path = require('path');
var async = require('async');
var BaseRepository = require("./base");
var LocalRepository = (function (_super) {
    __extends(LocalRepository, _super);
    function LocalRepository(system) {
        _super.call(this, system);
        this.localPaths = system.config.plugins.localRepositories;
    }
    /**
     * Load a plugin package from local repository.
     * @param options
     * name: name of package to get info
     * @returns {Promise}
     */
    LocalRepository.prototype.getPluginInfo = function (options) {
        if (_.isString(options)) {
            options = { id: options };
        }
        options = _.merge({ name: null, version: null }, options);
        var self = this;
        return new Promise(function (resolve, reject) {
            self.getPluginDir(options.id, function (err, dir) {
                if (err) {
                    return reject(err);
                }
                if (dir !== null) {
                    return self._readPlugin(dir, function (err, info) {
                        if (err) {
                            return reject(err);
                        }
                        info.id = options.id;
                        return resolve(info);
                    });
                }
                return resolve(null);
            });
        });
    };
    /**
     *
     * @param cb
     */
    LocalRepository.prototype.getPluginDirs = function (cb) {
        var dirs = [];
        async.each(this.localPaths, function (dir, done) {
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
     * @param cb
     */
    LocalRepository.prototype.getPluginDir = function (name, cb) {
        this.getPluginDirs(function (err, dirs) {
            if (err) {
                return cb(err);
            }
            var found = null;
            _.forEach(dirs, function (dir) {
                if (path.basename(dir) === name) {
                    found = dir;
                }
            });
            return cb(null, found);
        });
    };
    LocalRepository.prototype._readPlugin = function (dirpath, cb) {
        try {
            return cb(null, require(path.resolve(dirpath, 'plugin-package.js')));
        }
        catch (err) {
            if (err.code === "MODULE_NOT_FOUND") {
                return cb(new Error("The module " + dirpath + " does not seems to be a valid module and is invalid to load. Please check that the module contain package.json and plugin-package.js. \n" + err.stack));
            }
            return cb(err);
        }
    };
    return LocalRepository;
}(BaseRepository));
module.exports = LocalRepository;
