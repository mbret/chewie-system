'use strict';

var Sequelize = require('sequelize');
var Base = require('./base');
var _ = require('lodash');
var validator = require("validator");

module.exports = function(sequelize, system){

    var Model = function(){
        return sequelize.define('plugins', {
            
            name: {
                type: Sequelize.STRING,
                unique: true
            },

            // Backup of package.json
            modulePackage: {
                type: Sequelize.JSON,
                get: function(){
                    return _.isPlainObject(this.getDataValue('modulePackage')) ? this.getDataValue('modulePackage') : JSON.parse(this.getDataValue('modulePackage'));
                }
            },

            // Save content of plugin-package.js
            pluginPackage: {
                type: Sequelize.JSON,
                get: function(){
                    return _.isPlainObject(this.getDataValue('pluginPackage')) ? this.getDataValue('pluginPackage') : JSON.parse(this.getDataValue('pluginPackage'));
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
            },

            // These options are related to all declared modules with their name as key
            modulesOptions: {
                type: Sequelize.JSON,
                defaultValue: {}
            }
        },
        {
            freezeTableName: true, // Model tableName will be the same as the model name
            instanceMethods: {

                getModuleId: function(module) {
                    return this.get("name") + ':' + module.name;
                },

                getModules:  function(){
                    var self = this;
                    return this.get('pluginPackage').modules.map(function(module){
                        return _.merge({
                            id: self.getModuleId(module),
                            name: module.name,
                            type: module.type,
                            description: module.description,
                            userOptions: self.getModuleUserOptions(module.name)
                        }, { plugin: self.toJSON()});
                    });
                },

                getModuleByName: function(name){
                    var modules = this.getModules();
                    return modules.find(function(module){
                        return module.name === name;
                    })
                },

                getModule: function(id){
                    var self = this;
                    var modules = this.getModules();
                    return modules.find(function(module){
                        return self.getModuleId(module) === id;
                    })
                },

                hasModuleByName: function(name){
                    var module = this.getModuleByName(name);
                    return module ? true : false;
                },

                hasModule: function(id){
                    var module = this.getModule(id);
                    return module ? true : false;
                },

                getModuleUserOptions: function(moduleName) {
                    var modulesOptions = this.get("modulesOptions");
                    if(modulesOptions[moduleName]) {
                        return modulesOptions[moduleName];
                    }
                    return {};
                }

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
        });
    };

    var myModel = new Model();

    myModel.findAllModulesByUserId = function(id){
        return myModel.findAll({where: {userId: id}})
            .then(function(plugins){
                var modules = [];
                _.forEach(plugins, function(plugin){
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

    myModel.hasModuleByName = function(userId, pluginName, moduleName){
        return myModel.findOne({where: {userId: userId, name: pluginName}})
            .then(function(plugin){
                if(!plugin){
                    return false;
                }
                return plugin.hasModuleByName(moduleName);
            });
    };

    myModel.findByIdOrName = function(idOrName) {
        var search = {};
        if(validator.isInt(idOrName)) {
            search.id = idOrName;
        }
        else {
            search.name = idOrName;
        }

        return myModel.findOne({where: search});
    };

    myModel.toJSON = Base.toJSON;

    return myModel;
};