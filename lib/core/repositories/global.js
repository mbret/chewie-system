'use strict';

var async = require('async');
var path = require('path');
var fs = require('fs-extra')
var logger = LOGGER.getLogger('Repository');

class Repository{

    constructor(system){
        this.system = system;
        this.pluginsTmpDir = path.resolve(system.getConfig().system.dataDir, 'plugins');
    }

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
                        logger.debug('Plugin [%s] synchronized to [%s]', plugin.name, dest);
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