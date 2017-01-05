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

export interface ScenarioModel {
    id: number;
    deviceId: string;
    nodes: Array<ScenarioNodeModel>;
    name: string;
}

export interface ScenarioUpdatable {
    nodes?: Array<ScenarioNodeModel>;
    name?: string;
    description?: string;
}

export interface ScenarioNodeModel {
    id: number;
    pluginId: string; // plugin name
    type: string;
    moduleId: string; // module name
    options: any;
    nodes: Array<ScenarioNodeModel>
}