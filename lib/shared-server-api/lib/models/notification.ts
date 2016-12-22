'use strict';

let Sequelize = require('sequelize');
let _ = require('lodash');

module.exports = function(sequelize){

    return sequelize.define('notification', {
        // user id

        // @todo device id

        type: {
            type: Sequelize.ENUM("info", "warning", "danger"),
        },

        content: {
            type: Sequelize.STRING
        },

        options: {
            type: Sequelize.STRING,
            defaultValue: JSON.stringify({}),
            get: function() {
                return JSON.parse(this.getDataValue("options"));
            },
            set: function(val) {
                this.setDataValue("options", JSON.stringify(val));
            }
        },
    },
    {
        freezeTableName: true // Model tableName will be the same as the model name
    }
    );
};