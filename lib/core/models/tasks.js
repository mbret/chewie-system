'use strict';
var Sequelize = require('sequelize');
var uuid = require('uuid');
var Base = require('./base');
var _ = require('lodash');

module.exports = function(sequelize, system){

    var Model = sequelize.define('tasks', {
        module: {
            type: Sequelize.STRING,
        },
        name: {
            type: Sequelize.STRING,
        },
        // json
        options: {
            type: Sequelize.JSON,
            defaultValue: {},
            //get: function(){
            //    console.log(this.getDataValue('options'));
            //    return JSON.parse(this.getDataValue('options'));
            //}
        },
        // array of json
        triggers: {
            type: Sequelize.JSON,
            defaultValue: [],
            //get: function(){
            //    return JSON.parse(this.getDataValue('triggers'));
            //}
        }
    },
    {
        freezeTableName: true // Model tableName will be the same as the model name
    }
    );

    Model.isDirect = function(task){
        var direct = true;
        _.forEach(task.triggers, function(trigger){
            if(trigger.type !== 'direct'){
                direct = false;
            }
        });
        return direct;
    };

    Model.toJSON = Base.toJSON;

    return Model;
};