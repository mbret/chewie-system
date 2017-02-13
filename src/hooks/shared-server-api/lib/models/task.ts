'use strict';
import Base from "./base";
var Sequelize = require('sequelize');
var uuid = require('uuid');
var _ = require('lodash');

module.exports = function(sequelize, system){

    var Model = sequelize.define('task', {
        // @autoGenerated userId,
        // @autoGenerated pluginId

        // userId: Sequelize.INTEGER,
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

        // General task options
        // available for every triggers
        options: {
            type: Sequelize.JSON,
            defaultValue: {},
            get: function(){
                if(_.isPlainObject(this.getDataValue('options'))){
                    return this.getDataValue('options');
                }
                return JSON.parse(this.getDataValue('options'));
            }
        },
    },
    {
        freezeTableName: true, // Model tableName will be the same as the model name
        validate: {}
    }
    );

    Model.hook('beforeCreate', function(data, options){
        return new Promise(function(resolve, reject){
            return resolve();
        });
    });

    Model.toJSON = Base.toJSON;

    return Model;
};