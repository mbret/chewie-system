"use strict";
var Sequelize = require('sequelize');
function default_1(sequelize) {
    return sequelize.define('profile', {
        name: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false
        },
    }, {
        freezeTableName: true // Model tableName will be the same as the model name
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
;
