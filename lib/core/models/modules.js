'use strict';
var Sequelize = require('sequelize');
var uuid = require('uuid');
var Base = require('./base');
var _ = require('lodash');

module.exports = function(sequelize, system){

    var Model = sequelize.define('modules', {
        name: {
            type: Sequelize.STRING,
            unique: false,
        },
        type: {
            type: Sequelize.ENUM('task-module'),
        }
    },
    {
        freezeTableName: true // Model tableName will be the same as the model name
    }
    );

    Model.build().toJSON = function(){
        return {
            id: this.get('id'),
        }
    };

    Model.toJSON = Base.toJSON;

    return Model;
};