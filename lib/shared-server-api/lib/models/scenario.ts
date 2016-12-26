'use strict';

import * as Sequelize from "sequelize";

module.exports = function(sequelize){

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
            get: function() {
                return JSON.parse(this.getDataValue("nodes"));
            },
            set: function(val) {
                this.setDataValue("nodes", JSON.stringify(val));
            }
        },
    },
    {
        freezeTableName: true, // Model tableName will be the same as the model name
        validate: {}
    }
    );
};

export interface Scenario {
    id: number;
    deviceId: string;
    nodes: Array<ScenarioNode>;
}

export interface ScenarioNode {
    id: number;
    pluginId: string;
}