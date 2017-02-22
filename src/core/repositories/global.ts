'use strict';

let async = require('async');
let path = require('path');
let fs = require('fs-extra');
let npm = require("npm");
let child_process = require("child_process");
let which = require('which');
import { EventEmitter }  from "events";
import {System} from "../../system";

class Repository extends EventEmitter {

    system: System;
    logger: any;
    npmPath: string;

    constructor(system){
        super();
        this.logger = system.logger.getLogger('Repository');
        this.system = system;
        this.npmPath = which.sync('npm');
    }

    /**
     * Synchronize an app plugins to its repository.
     * @param plugin a database object
     * @returns {Promise}
     */
    synchronize(plugin) {
        let self = this;
        let pluginDir = self.system.localRepository.getPluginDir(plugin.name);
        let dest = path.resolve(self.system.config.synchronizedPluginsPath, plugin.name);

        return self.pluginExistByDir(pluginDir)
            .then(function(stat) {
                if(!stat.exist) {
                    throw new Error('Unable to synchronize plugin ' + plugin.name + ' because the plugin directory ' + pluginDir + ' does not seems to exist anymore');
                }
                self.logger.verbose("Plugin dir %s exist and is ready to be synchronized", pluginDir, stat);
                return self.pluginExistByDir(dest)
                    .then(function(stat) {
                        // @todo for now ignore existance, always force synchronize
                        // Copy local plugin dir into plugin tmp dir
                        // This directoy contain the plugin from all source (local, remote, etc)
                        // They will also be npm installed to get all required dependancies
                        self.logger.verbose("Plugin dir %s will be copied to %s", pluginDir, dest, stat);
                        return new Promise(function(resolve, reject) {
                            fs.copy(pluginDir, dest, function(err){
                                if(err) {
                                    return reject(err);
                                }
                                self.logger.debug('Plugin [%s] synchronized to [%s]', plugin.name, dest);
                                self.logger.debug('Run npm install for plugin %s', plugin.name);
                                return self.npmInstall(dest)
                                    .then(function() {
                                        self.system.emit("plugin:synchronized", plugin);
                                        return resolve();
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
        const ls = child_process.spawn(this.npmPath, ['install'], { cwd: pluginDir });

        ls.stdout.on('data', (data) => {
            //self.logger.debug(`stdout: ${data}`);
        });

        ls.stderr.on('data', (data) => {
            //self.logger.debug(`stderr: ${data}`);
        });

        return new Promise(function(resolve, reject) {
            ls.on('close', (code) => {
                self.logger.debug(`${pluginDir} npm install child process exited with code ${code}`);
                return resolve();
            });
        });
    }

    getSynchronizedPluginDir(name) {
        return path.resolve(this.system.config.synchronizedPluginsPath, name);
    }

    /**
     * Check if a valid plugin exist in this path
     * @param name
     */
    pluginExist(name) {
        return this.pluginExistByDir(this.getSynchronizedPluginDir(name));
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