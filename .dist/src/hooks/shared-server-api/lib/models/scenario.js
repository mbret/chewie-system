'use strict';
const Sequelize = require("sequelize");
module.exports = function (sequelize) {
    return sequelize.define('scenario', {
        deviceId: {
            type: Sequelize.STRING,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            defaultValue: ''
        },
        nodes: {
            type: Sequelize.STRING,
            defaultValue: JSON.stringify({}),
            get: function () {
                return JSON.parse(this.getDataValue("nodes"));
            },
            set: function (val) {
                this.setDataValue("nodes", JSON.stringify(val));
            }
        },
        autoStart: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false
        }
    }, {
        freezeTableName: true,
        validate: {}
    });
};
class ScenarioModel {
}
exports.ScenarioModel = ScenarioModel;
//# sourceMappingURL=scenario.js.map