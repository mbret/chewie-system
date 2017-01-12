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

        autoStart: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false
        }
    },
    {
        freezeTableName: true, // Model tableName will be the same as the model name
        validate: {}
    }
    );
};

export class ScenarioModel {
    id: number;
    deviceId: string;
    pluginId: string; // plugin name
    nodes: Array<ScenarioModel>;
    moduleId: string; // module name
    name: string;
    // only when used as root
    autoStart: boolean;
    type: string; // not for root
    options: any; // not for root
}

export interface ScenarioUpdatable {
    nodes?: Array<ScenarioModel>;
    name?: string;
    description?: string;
    autoStart?: boolean;
}

// export interface ScenarioNodeModel {
//     id: number;
//     pluginId: string; // plugin name
//     type: string;
//     moduleId: string; // module name
//     options: any;
//     nodes: Array<ScenarioNodeModel>,
// }