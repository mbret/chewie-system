'use strict';
const Sequelize = require("sequelize");
module.exports = function (sequelize) {
    return sequelize.define('notification', {
        userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        type: {
            type: Sequelize.ENUM("info", "warning", "error"),
            allowNull: false
        },
        from: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        content: {
            type: Sequelize.STRING,
            allowNull: false
        },
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
        freezeTableName: true
    });
};
