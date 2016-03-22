'use strict';
var Sequelize = require('sequelize');
var uuid = require('uuid');
var Base = require('./base');
var _ = require('lodash');

module.exports = function(sequelize, system){

    var User = sequelize.define('user', {
        username: {
            type: Sequelize.STRING,
            unique: true
        },
        firstName: {
            type: Sequelize.STRING,
        },
        lastName: {
            type: Sequelize.STRING
        },
        config: {
            type: Sequelize.JSON,
            defaultValue: {

                // Used to store external services credentials
                externalServices: {
                    google: {
                        auth: {
                            clientId: null,
                            clientSecret: null
                        }
                    }
                },

                screens: [
                    // default screen
                    {
                        id: uuid.v4(),
                        name: 'Default',
                        description: 'This is your first screen'
                    }
                ]
            },
            get: function(){
                return JSON.parse(this.getDataValue('config'));
            }
        }
    },
    {
        freezeTableName: true // Model tableName will be the same as the model name
    }
    );

    User.build().toJSON = function(){
        return {
            id: this.get('id'),
            username: this.get('username'),
            config: this.get('config'),
        }
    };

    /**
     * Init admin user is it does not exist yet.
     * @returns {Promise.<Instance>}
     */
    User.initAdmin = function(){
        return User.findOrCreate({
            where: {
                username: 'admin'
            },
            defaults: {
                username: 'admin'
            }
        });
    };

    User.toJSON = Base.toJSON;

    return User;
};