"use strict";
let Sequelize = require('sequelize');

export default function(sequelize){

    return sequelize.define('profile', {
            name: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
        }, {
            freezeTableName: true // Model tableName will be the same as the model name
        }
    );
};