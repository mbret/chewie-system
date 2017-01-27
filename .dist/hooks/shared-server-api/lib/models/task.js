'use strict';
var Sequelize = require('sequelize');
var uuid = require('uuid');
var Base = require('./base');
var _ = require('lodash');
module.exports = function (sequelize, system) {
    var Model = sequelize.define('task', {
        name: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false
        },
        moduleId: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            defaultValue: ''
        },
        options: {
            type: Sequelize.JSON,
            defaultValue: {},
            get: function () {
                if (_.isPlainObject(this.getDataValue('options'))) {
                    return this.getDataValue('options');
                }
                return JSON.parse(this.getDataValue('options'));
            }
        },
    }, {
        freezeTableName: true,
        validate: {}
    });
    Model.hook('beforeCreate', function (data, options) {
        return new Promise(function (resolve, reject) {
            return resolve();
        });
    });
    Model.toJSON = Base.toJSON;
    return Model;
};
//# sourceMappingURL=task.js.map