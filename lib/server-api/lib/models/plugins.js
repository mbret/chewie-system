'use strict';

var Sequelize = require('sequelize');
var Base = require('./base');
var _ = require('lodash');
var validator = require("validator");

module.exports = function(sequelize, system){

    var Model = function(){
        return sequelize.define('plugins', {

            id: {
                type: Sequelize.STRING,
                unique: true,
                primaryKey: true
            },

            name: {
                type: Sequelize.STRING,
                unique: true
            },

            // Save content of plugin-package.js
            modules: {
                type: Sequelize.STRING,
                get: function() {
                    return JSON.parse(this.getDataValue("modules"));
                },
                set: function(val) {
                    //console.log(JSON.stringify(val[0]), val[0]);
                    this.setDataValue("modules", JSON.stringify(val));
                }
            },

            version: {
                type: Sequelize.STRING
            },

            description: {
                type: Sequelize.STRING
            },

            repository: {
                type: Sequelize.ENUM('local', 'remote'),
                defaultValue: 'local'
            },

            // User options
            // These options are related to pluginPackage.options
            userOptions: {
                type: Sequelize.STRING,
                defaultValue: JSON.stringify({}),
                get: function() {
                    return JSON.parse(this.getDataValue("userOptions"));
                },
                set: function(val) {
                    this.setDataValue("userOptions", JSON.stringify(val));
                }
            },

            // These options are related to all declared modules with their name as key
            modulesOptions: {
                type: Sequelize.JSON,
                defaultValue: {}
            },

            // typically what is inside plugin-package.json
            config: {
                type: Sequelize.STRING,
                get: function() {
                    return JSON.parse(this.getDataValue("config"));
                },
                set: function(val) {
                    this.setDataValue("config", JSON.stringify(val));
                }
            }
        },
        {
            freezeTableName: true, // Model tableName will be the same as the model name
            instanceMethods: {

                getModules:  function(){
                    var self = this;
                    return this.get('modules').map(function(module){
                        return _.merge({}, module, {
                            userOptions: self.getModuleUserOptions(module.name),
                            plugin: self.toJSON()
                        });
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
                        return module.id === id;
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
                },
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