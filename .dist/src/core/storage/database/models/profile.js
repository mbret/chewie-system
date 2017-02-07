"use strict";
let Sequelize = require('sequelize');
function default_1(sequelize) {
    return sequelize.define('profile', {
        name: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false
        },
    }, {
        freezeTableName: true
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
;
//# sourceMappingURL=profile.js.map