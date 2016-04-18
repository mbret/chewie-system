'use strict';
var Sequelize = require('sequelize');
var uuid = require('uuid');
var Base = require('./base');
var _ = require('lodash');

module.exports = function(sequelize, system){

    var Model = sequelize.define('task', {
        // userId,

        module: {
            type: Sequelize.STRING,
        },

        name: {
            type: Sequelize.STRING,
        },

        description: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        // Define wheter a task should be running or not.
        // active: true means the taks is run on profile started.
        active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },

        // json
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

        // array of json
        triggers: {
            type: Sequelize.JSON,
            defaultValue: [],
            get: function(){
                if(_.isArray(this.getDataValue('triggers'))){
                    return this.getDataValue('triggers');
                }
                return JSON.parse(this.getDataValue('triggers'));
            }
        }
    },
    {
        freezeTableName: true, // Model tableName will be the same as the model name
        validate: {

            // Check if triggers are valids
            triggersWellFormed: function(){
                if(!Array.isArray(this.triggers)){
                    throw new Error('Not array');
                }
                this.triggers.forEach(function(trigger){
                    if(!_.isPlainObject(trigger)){
                        throw new Error('A trigger is not a plain object');
                    }

                    // Check trigger type
                    if(trigger.type === 'schedule'){
                        if(!trigger.schedule){
                            throw new Error('Invalid trigger schedule: ' + JSON.stringify(trigger));
                        }
                    }
                });
            }
        }
    }
    );

    Model.hook('beforeCreate', function(data, options){
        return new Promise(function(resolve, reject){

            // create unique id for all triggers
            data.triggers.forEach(function(trigger){
                // default data
                trigger.id = uuid.v4();
                trigger.running = false;
                trigger.schedule = trigger.schedule || null;
                trigger.outputAdapters = trigger.outputAdapters || [];
            });

            return resolve();
        });
    });

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