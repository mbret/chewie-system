'use strict';

let async = require('async');
let path = require('path');
let fs = require('fs-extra');
let npm = require("npm");
let child_process = require("child_process");
let shell = require('shelljs');
import { EventEmitter }  from "events";
import {System} from "../../system";
import {debug} from "../../shared/debug";
import {ignored} from "../../shared/ignore";
import {PluginModel} from "../shared-server-api/lib/models/plugins";
let gulp = require("gulp");
const changed = require('gulp-changed');

class Repository extends EventEmitter {

    system: System;
    logger: any;
    npmPath: string;
    yarnPath: string;

    constructor(system) {
        super();
        this.logger = system.logger.getLogger('Repository');
        this.system = system;
        this.npmPath = shell.which('npm').stdout;
        this.yarnPath = shell.which('yarn').stdout;
    }

    /**
     * Synchronize an app plugins to its repository.
     * @param plugin a database object
     * @returns {Promise}
     */
    synchronize(plugin) {
        let self = this;
        let pluginDir = null;
        // plugin from local source
        if (plugin.repository === "source") {
            pluginDir = path.resolve(plugin.source);
        } else {
            // plugin from local repository
            pluginDir = self.system.localRepository.getPluginDir(plugin.name);
        }
        let dest = path.resolve(self.system.config.synchronizedPluginsPath, plugin.name);

        // first check if plugin exist at its source
        return self.pluginExistByDir(pluginDir)
            .then(function(stat) {
                if(!stat.exist) {
                    throw new Error('Unable to synchronize plugin ' + plugin.name + ' because the plugin directory ' + pluginDir + ' does not seems to exist anymore');
                }
                self.logger.verbose("Plugin dir %s exist and is ready to be synchronized", pluginDir, stat);
                // then check if a plugin is already synchronized
                return self.pluginExistByDir(dest)
                    .then(function(stat) {
                        // @todo for now ignore existence, always force synchronize
                        // try to read .chewieignore
                        return new Promise(function(resolve, reject) {
                            fs.readFile(path.resolve(pluginDir, ".chewieignore"), "utf8", function(err, chewieIgnorePattern) {
                                if (err && err.code !== "ENOENT") return reject(err);
                                // Copy local plugin dir into plugin tmp dir
                                // This directory contain the plugin from all source (local, remote, etc)
                                // They will also be npm installed to get all required dependencies
                                let glob = ["**/**", "!node_modules/**", "!.git/**"];
                                if (chewieIgnorePattern) {
                                    glob = glob.concat(ignored(chewieIgnorePattern).map((item) => "!" + item));
                                }
                                debug("repositories:global")("Plugin %s from %s will be copied to %s with glob [%s]", plugin.name, pluginDir, dest, glob);
                                gulp.src(glob, {cwd: pluginDir, dot: true, read: true})
                                    // avoid too many disk access
                                    .pipe(changed(dest))
                                    .pipe(gulp.dest(dest))
                                    .on("error", function(err) {
                                        return reject(err);
                                    })
                                    .on("finish", function() {
                                        debug("repositories:global")('Plugin [%s] synchronized to [%s]', plugin.name, dest);
                                        debug("repositories:global")('Run npm install for plugin %s', plugin.name);
                                        return self.npmInstall(dest)
                                            .then(function() {
                                                self.system.emit("plugin:synchronized", plugin);
                                                return resolve();
                                            });
                                    });
                            });
                        });
                    });
            })
            .then(function() {
                return dest;
            });
    }

    npmInstall(pluginDir) {
        let self = this;
        let stderr = "";
        // yarn is way more fast than npm
        const ls = child_process.spawn(this.yarnPath, ["install", "--production"], { cwd: pluginDir });

        ls.stdout.on('data', (data) => {
            // self.logger.debug(`stdout: ${data}`);
        });

        // it print warning like (no descriptions, etc)
        ls.stderr.on('data', (data) => {
            stderr += data;
        });

        return new Promise(function(resolve, reject) {
            ls.on('close', (code) => {
                self.logger.debug(`${pluginDir} yarn install child process exited with code ${code}`);
                if (code !== 0) {
                    return reject(new Error("Yarn command failed. stderr:" + stderr));
                }
                return resolve();
            });
        });
    }

    getSynchronizedPluginDir(name) {
        return path.resolve(this.system.config.synchronizedPluginsPath, name);
    }

    /**
     * Check if a valid plugin exist in this path
     */
    pluginExist(plugin: PluginModel) {
        let pluginPath = path.resolve(this.system.config.synchronizedPluginsPath, plugin.name);
        return this.pluginExistByDir(pluginPath);
    }

    protected pluginExistByDir(dir): any {
        let pluginStats = { exist: false, isValid: false };
        return new Promise(function(resolve, reject) {
            fs.stat(dir, function(err, stats) {
                if (err) {
                    // does not exist
                    if (err.code === "ENOENT") {
                        return resolve(pluginStats);
                    }
                    return reject(err);
                }
                if (stats.isDirectory()) {
                    // @todo check validity
                    pluginStats.exist = true;
                    pluginStats.isValid = true;
                } else {
                    // ..
                }
                return resolve(pluginStats);
            })
        });
    }
}


module.exports = Repository;