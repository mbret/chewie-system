'use strict';

import * as Sequelize from "sequelize";
import * as uuid from "uuid";
import * as validator from "validator";
import * as _ from "lodash";
import Base from "./base";

module.exports = function(sequelize, system){

    let User = sequelize.define('user', {
        username: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false
        },

        firstName: {
            type: Sequelize.STRING
        },

        lastName: {
            type: Sequelize.STRING
        },

        role: {
            type: Sequelize.ENUM('admin', 'user'),
            defaultValue: 'user',
            allowNull: false
        },

        // ex: profile-img-user-1-timestamp.ext
        // accessible via classic img cdn
        profileImage: {
            type: Sequelize.STRING,
            defaultValue: null
        },

        // User config act as a second configuration for system
        // It contains all user preferences
        // These preferences are only active when a profile is loaded
        config: {
            type: Sequelize.JSON,
            defaultValue: {

                // Used to store external services credentials
                externalServices: {
                    google: {
                        auth: {
                            clientId: null,
                            clientSecret: null,
                        },
                        accessToken: null,
                        refreshToken: null
                    }
                },

                foo: 'bar',

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
                return _.isPlainObject(this.getDataValue('config')) ? this.getDataValue('config') : JSON.parse(this.getDataValue('config'));
            }
        },

        createdAt: {
            type: Sequelize.INTEGER,
            defaultValue: Math.floor(Date.now() / 1000)
        },

        updatedAt: {
            type: Sequelize.INTEGER,
            allowNull: true
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
            config: this.get('config')
        }
    };

    User.findByIdOrUsername = function(idOrUsername) {
        let search: any = {};
        if(validator.isInt(idOrUsername)) {
            search.id = idOrUsername;
        }
        else {
            search.username = idOrUsername;
        }

        return User.findOne({where: search});
    };

    User.toJSON = Base.toJSON;

    return User;
};
// 2017-04-29 14:09:05.926 +00:00