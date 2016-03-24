'use strict';
var Sequelize = require('sequelize');
var uuid = require('uuid');
var Base = require('./base');
var _ = require('lodash');

module.exports = function(sequelize, system){

    var Model = sequelize.define('plugins', {
        name: {
            type: Sequelize.STRING,
        },
        // Backup of package.json
        modulePackage: {
            type: Sequelize.JSON,
        },
        // Save content of plugin-package.js
        pluginPackage: {
            type: Sequelize.JSON,
            get: function(){
                return JSON.parse(this.getDataValue('pluginPackage'));
            }
        },
        version: {
            type: Sequelize.STRING,
        },
        description: {
            type: Sequelize.STRING,
        },
        repository: {
            type: Sequelize.ENUM('local', 'remote'),
            defaultValue: 'local'
        }
    },
    {
        freezeTableName: true, // Model tableName will be the same as the model name
        instanceMethods: {

            getModules:  function(){
                var self = this;
                return this.get('pluginPackage').modules.map(function(module){
                    return _.merge(module, { plugin: self.toJSON()});
                });
            },

            hasModule: function(name){
                var modules = this.getModules();
                return modules.find(function(module){
                    return module.name === name;
                })
            },

            toJSON: function(){
                return {
                    id: this.get('id'),
                    name: this.get('name'),
                    version: this.get('version'),
                    description: this.get('description'),
                    repository: this.get('repository')
                }
            }
        }
    }
    );

    Model.findAllModulesByUserId = function(id){
        return Model.findAll({where: {userId: id}})
            .then(function(data){
                var modules = [];
                _.forEach(data, function(plugin){
                    modules = modules.concat(plugin.getModules());
                });
                return modules;
            })
    };

    Model.findAllPluginModulesByUserId = function(id, pluginId){
        return Model.findAll({where: {userId: id, id: pluginId}})
            .then(function(data){
                var modules = [];
                _.forEach(data, function(plugin){
                    modules = modules.concat(plugin.getModules());
                });
                return modules;
            })
    };

    Model.hasModule = function(userId, pluginName, moduleName){
        return Model.findOne({where: {userId: userId, name: pluginName}})
            .then(function(plugin){
                if(!plugin){
                    return false;
                }
                return plugin.hasModule(moduleName);
            });
    };

    Model.toJSON = Base.toJSON;

    return Model;
};