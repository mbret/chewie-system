'use strict';
var Sequelize = require('sequelize');
var uuid = require('uuid');
var Base = require('./base');
var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events');

module.exports = function(sequelize, system){

    var Model = function(){
        return sequelize.define('plugins', {
                name: {
                    type: Sequelize.STRING,
                },

                // Backup of package.json
                modulePackage: {
                    type: Sequelize.JSON,
                    get: function(){
                        return JSON.parse(this.getDataValue('modulePackage'));
                    }
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
                },

                // User options
                // These options are related to pluginPackage.options
                userOptions: {
                    type: Sequelize.JSON,
                    defaultValue: {},
                    get: function(){
                        return _.isPlainObject(this.getDataValue('userOptions')) ? this.getDataValue('userOptions') : JSON.parse(this.getDataValue('userOptions'));
                    }
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

                    //toJSON: function(){
                    //    return {
                    //        id: this.get('id'),
                    //        name: this.get('name'),
                    //        version: this.get('version'),
                    //        description: this.get('description'),
                    //        repository: this.get('repository')
                    //    }
                    //}
                }
            }
        );
    };

    var myModel = new Model();

    myModel.findAllModulesByUserId = function(id){
        return myModel.findAll({where: {userId: id}})
            .then(function(data){
                var modules = [];
                _.forEach(data, function(plugin){
                    modules = modules.concat(plugin.getModules());
                });
                return modules;
            });
    };

    myModel.findAllPluginModulesByUserId = function(id, pluginId){
        return myModel.findAll({where: {userId: id, id: pluginId}})
            .then(function(data){
                var modules = [];
                _.forEach(data, function(plugin){
                    modules = modules.concat(plugin.getModules());
                });
                return modules;
            })
    };

    myModel.hasModule = function(userId, pluginName, moduleName){
        return myModel.findOne({where: {userId: userId, name: pluginName}})
            .then(function(plugin){
                if(!plugin){
                    return false;
                }
                return plugin.hasModule(moduleName);
            });
    };

    myModel.toJSON = Base.toJSON;

    return myModel;
};