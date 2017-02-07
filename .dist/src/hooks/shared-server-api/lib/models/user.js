'use strict';
var Sequelize = require('sequelize');
var uuid = require('uuid');
var Base = require('./base');
var _ = require('lodash');
var validator = require("validator");
module.exports = function (sequelize, system) {
    var User = sequelize.define('user', {
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
        profileImage: {
            type: Sequelize.STRING,
            defaultValue: null
        },
        config: {
            type: Sequelize.JSON,
            defaultValue: {
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
                    {
                        id: uuid.v4(),
                        name: 'Default',
                        description: 'This is your first screen'
                    }
                ]
            },
            get: function () {
                return _.isPlainObject(this.getDataValue('config')) ? this.getDataValue('config') : JSON.parse(this.getDataValue('config'));
            }
        }
    }, {
        freezeTableName: true
    });
    User.build().toJSON = function () {
        return {
            id: this.get('id'),
            username: this.get('username'),
            config: this.get('config')
        };
    };
    User.initAdmin = function () {
        return User.findOrCreate({
            where: {
                username: 'admin'
            },
            defaults: {
                username: 'admin',
                firstName: 'Admin',
                role: 'admin'
            }
        });
    };
    User.findByIdOrUsername = function (idOrUsername) {
        var search = {};
        if (validator.isInt(idOrUsername)) {
            search.id = idOrUsername;
        }
        else {
            search.username = idOrUsername;
        }
        return User.findOne({ where: search });
    };
    User.toJSON = Base.toJSON;
    return User;
};
//# sourceMappingURL=user.js.map