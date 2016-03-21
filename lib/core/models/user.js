'use strict';
var Sequelize = require('sequelize');

module.exports = function(sequelize, system){

    var User = sequelize.define('user',
        {
            username: {
                type: Sequelize.STRING,
            },
            firstName: {
                type: Sequelize.STRING,
            },
            lastName: {
                type: Sequelize.STRING
            }
        },
        {
            freezeTableName: true // Model tableName will be the same as the model name
        }
    );

    /**
     * Init admin user is it does not exist yet.
     * @returns {Promise.<Instance>}
     */
    User.initAdmin = function(){
        return User.findOrCreate({
            where: {
                username: 'admin'
            },
            default: {
                username: 'admin'
            }
        });
    };

    return User;
};