'use strict';
var Sequelize = require('sequelize');
var uuid = require('uuid');
var Base = require('./base');
var _ = require('lodash');
module.exports = function (sequelize, system) {
    var Model = sequelize.define('scenario', {
        name: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            defaultValue: ''
        },
        nodes: {
            type: Sequelize.STRING,
            defaultValue: JSON.stringify({}),
            get: function () {
                return JSON.parse(this.getDataValue("nodes"));
            },
            set: function (val) {
                this.setDataValue("nodes", JSON.stringify(val));
            }
        },
    }, {
        freezeTableName: true,
        validate: {}
    });
    return Model;
};