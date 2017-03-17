'use strict';
import * as Sequelize from "sequelize";
import * as _ from "lodash";

module.exports = function (sequelize) {
    return sequelize.define('notification', {
        // user id
        userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        // @todo device id
        type: {
            type: Sequelize.ENUM("info", "warning", "error"),
            allowNull: false
        },
        // from device id
        from: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        content: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // more extra options
        options: {
            type: Sequelize.STRING,
            defaultValue: JSON.stringify({}),
            get: function () {
                return JSON.parse(this.getDataValue("options"));
            },
            set: function (val) {
                this.setDataValue("options", JSON.stringify(val));
            }
        },
    }, {
        freezeTableName: true // Model tableName will be the same as the model name
    });
};
