'use strict';

import * as Sequelize from "sequelize";
import Base from "./base";
import * as _ from "lodash";
import * as validator from "validator";

module.exports = function(sequelize){

    /**
     * A plugin is defined by its name, its version and its source.
     * We do not need any more info since we will read synchronized package during runtime.
     *
     * The name is used to read the correct folder.
     * The version is used to know if the synchronized plugin is correct or if a newer version of the one installed is available.
     *
     * @returns {*|{}}
     * @constructor
     */
    let Model = sequelize.define('plugins', {

            deviceId: {
                type: Sequelize.STRING,
                allowNull: false
            },

            name: {
                type: Sequelize.STRING,
                unique: true
            },

            version: {
                type: Sequelize.STRING
            },

            repository: {
                type: Sequelize.ENUM('local', 'remote', "source"),
                allowNull: false
            },

            // used for remote/source repository
            source: {
                type: Sequelize.STRING,
                allowNull: true
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
            // modulesOptions: {
            //     type: Sequelize.JSON,
            //     defaultValue: {}
            // },

            // inside plugin-package
            package: {
                type: Sequelize.STRING,
                allowNull: false,
                get: function() {
                    return JSON.parse(this.getDataValue("package"));
                },
                set: function(val) {
                    this.setDataValue("package", JSON.stringify(val));
                }
            }
        },
        {
            freezeTableName: true, // Model tableName will be the same as the model name
            instanceMethods: {

                // getModules:  function(){
                //     var self = this;
                //     return this.get('package').modules.map(function(module){
                //         return _.merge({}, module, {
                //             userOptions: self.getModuleUserOptions(module.name),
                //             plugin: self.toJSON()
                //         });
                //     });
                // },

                getModuleByName: function(name){
                    var modules = this.getModules();
                    return modules.find(function(module){
                        return module.name === name;
                    })
                },

                getModule: function(id){
                    var modules = this.getModules();
                    return modules.find(function(module){
                        return module.id === id;
                    })
                },

                // hasModuleByName: function(name){
                //     var module = this.getModuleByName(name);
                //     return module ? true : false;
                // },

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

    // myModel.findAllModulesByUserId = function(id){
    //     return myModel.findAll({where: {userId: id}})
    //         .then(function(plugins){
    //             let modules = [];
    //             _.forEach(plugins, function(plugin){
    //                 modules = modules.concat(plugin.getModules());
    //             });
    //             return modules;
    //         });
    // };

    Model.findAllPluginModulesByUserId = function(id, pluginId){
        return Model.findAll({where: {userId: id, id: pluginId}})
            .then(function(data){
                var modules = [];
                _.forEach(data, function(plugin){
                    modules = modules.concat(plugin.getModules());
                });
                return modules;
            });
    };

    // Model.prototype.hasModuleByName = function(userId, pluginName, moduleName){
    //     return Model.findOne({where: {userId: userId, name: pluginName}})
    //         .then(function(plugin){
    //             if(!plugin){
    //                 return false;
    //             }
    //             return plugin.hasModuleByName(moduleName);
    //         });
    // };

    Model.findByIdOrName = function(idOrName) {
        var search: any = {};
        if(validator.isInt(idOrName)) {
            search.id = idOrName;
        }
        else {
            search.name = idOrName;
        }

        return Model.findOne({where: search});
    };

    Model.toJSON = Base.toJSON;

    return Model;
};

export interface Plugin {
    id: number;
    deviceId: string;
    name: string;
    repository: string;
    source: string;
    userOptions: any;
    package: {
        main: string;
        chewie: {
            modules: Array<any>
        }
    };
}