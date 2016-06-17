'use strict';

var async = require('async');
var path = require('path');
var fs = require('fs-extra')

class Repository{

    constructor(system){
        this.logger = system.logger.Logger.getLogger('Repository');

        this.system = system;
        this.pluginsTmpDir = system.getConfig().system.synchronizedPluginsDir;
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
                self.system.localRepository.getPluginDir(plugin.name, function(err, dir){
                    if(err){
                       return done(err);
                    }
                    if(!dir){
                        return done(new Error('Unable to synchronize plugin ' + plugin.name + ' because the plugin directory does not seems to exist'));
                    }
                    var dest = path.resolve(self.pluginsTmpDir, plugin.name);
                    fs.copy(dir, dest, function(err){
                        if(err){
                            return done(err);
                        }
                        self.logger.debug('Plugin [%s] synchronized to [%s]', plugin.name, dest);
                        return done();
                    });
                });
            }, function(err){
                if(err){
                    return reject(err);
                }
                return resolve();
            });
        });
    }
}

module.exports = Repository;