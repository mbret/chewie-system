'use strict';

var async = require('async');
var path = require('path');
var fs = require('fs-extra');
var npm = require("npm");
var child_process = require("child_process");
var which = require('which');

class Repository{

    constructor(system){
        this.logger = system.logger.Logger.getLogger('Repository');
        this.system = system;
        this.pluginsTmpDir = system.config.system.synchronizedPluginsDir;
        this.npmPath = which.sync('npm');
    }

    /**
     *
     * @param plugins a database object
     * @returns {Promise}
     */
    synchronize(plugins){
        var self = this;
        return new Promise(function(resolve, reject){
            async.each(plugins, function(plugin, done){

                var pluginDir = self.system.localRepository.getPluginDir(plugin.name);//, function(err, dir){
                self.system.localRepository.pluginExist(pluginDir)
                    .then(function(exist) {
                        if(!exist) {
                            return done(new Error('Unable to synchronize plugin ' + plugin.name + ' because the plugin directory ' + pluginDir + ' does not seems to exist anymore'));
                        }
                        var dest = path.resolve(self.pluginsTmpDir, plugin.name);

                        // Copy local plugin dir into plugin tmp dir
                        // This directoy contain the plugin from all source (local, remote, etc)
                        // They will also be npm installed to get all required dependancies
                        fs.copy(pluginDir, dest, function(err){
                            if(err){
                                return done(err);
                            }
                            self.logger.debug('Plugin [%s] synchronized to [%s]', plugin.name, dest);
                            self.logger.debug('Run npm install for plugin %s', plugin.name);
                            self.npmInstall(dest, function(err) {
                                return done(err);
                            });
                        });
                    })
                    .catch(done);
            }, function(err){
                if(err){
                    return reject(err);
                }
                return resolve();
            });
        });
    }

    npmInstall(pluginDir, cb) {
        var self = this;
        const ls = child_process.spawn(this.npmPath, ['install'], { cwd: pluginDir });

        ls.stdout.on('data', (data) => {
            //self.logger.debug(`stdout: ${data}`);
        });

        ls.stderr.on('data', (data) => {
            //self.logger.debug(`stderr: ${data}`);
        });

        ls.on('close', (code) => {
            self.logger.debug(`${pluginDir} npm install child process exited with code ${code}`);
            return cb();
        });
    }
}

module.exports = Repository;