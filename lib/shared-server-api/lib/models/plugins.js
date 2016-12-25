'use strict';
let Sequelize = require('sequelize');
let Base = require('./base');
let _ = require('lodash');
let validator = require("validator");
module.exports = function (sequelize) {
    let Model = function () {
        return sequelize.define('plugins', {
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
                type: Sequelize.ENUM('local', 'remote'),
                allowNull: false
            },
            source: {
                type: Sequelize.STRING,
                allowNull: true
            },
            userOptions: {
                type: Sequelize.STRING,
                defaultValue: JSON.stringify({}),
                get: function () {
                    return JSON.parse(this.getDataValue("userOptions"));
                },
                set: function (val) {
                    this.setDataValue("userOptions", JSON.stringify(val));
                }
            },
            package: {
                type: Sequelize.STRING,
                allowNull: false,
                get: function () {
                    return JSON.parse(this.getDataValue("package"));
                },
                set: function (val) {
                    this.setDataValue("package", JSON.stringify(val));
                }
            }
        }, {
            freezeTableName: true,
            instanceMethods: {
                getModuleByName: function (name) {
                    var modules = this.getModules();
                    return modules.find(function (module) {
                        return module.name === name;
                    });
                },
                getModule: function (id) {
                    var modules = this.getModules();
                    return modules.find(function (module) {
                        return module.id === id;
                    });
                },
                hasModuleByName: function (name) {
                    var module = this.getModuleByName(name);
                    return module ? true : false;
                },
                hasModule: function (id) {
                    var module = this.getModule(id);
                    return module ? true : false;
                },
                getModuleUserOptions: function (moduleName) {
                    var modulesOptions = this.get("modulesOptions");
                    if (modulesOptions[moduleName]) {
                        return modulesOptions[moduleName];
                    }
                    return {};
                },
            }
        });
    };
    var myModel = new Model();
    myModel.findAllPluginModulesByUserId = function (id, pluginId) {
        return myModel.findAll({ where: { userId: id, id: pluginId } })
            .then(function (data) {
            var modules = [];
            _.forEach(data, function (plugin) {
                modules = modules.concat(plugin.getModules());
            });
            return modules;
        });
    };
    myModel.hasModuleByName = function (userId, pluginName, moduleName) {
        return myModel.findOne({ where: { userId: userId, name: pluginName } })
            .then(function (plugin) {
            if (!plugin) {
                return false;
            }
            return plugin.hasModuleByName(moduleName);
        });
    };
    myModel.findByIdOrName = function (idOrName) {
        var search = {};
        if (validator.isInt(idOrName)) {
            search.id = idOrName;
        }
        else {
            search.name = idOrName;
        }
        return myModel.findOne({ where: search });
    };
    myModel.toJSON = Base.toJSON;
    return myModel;
};
