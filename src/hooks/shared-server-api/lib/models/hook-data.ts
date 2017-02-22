'use strict';

import * as Sequelize from "sequelize";

export function define(sequelize) {
    return sequelize.define('hookData', {

            deviceId: {
                type: Sequelize.STRING,
                allowNull: false
            },

            hookName: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },

            key: {
                type: Sequelize.STRING,
                defaultValue: ''
            },

            data: {
                type: Sequelize.STRING,
                defaultValue: JSON.stringify({}),
                get: function() {
                    return JSON.parse(this.getDataValue("data"));
                },
                set: function(val) {
                    this.setDataValue("data", JSON.stringify(val));
                }
            },
        },
        {
            freezeTableName: true, // Model tableName will be the same as the model name
            validate: {}
        }
    );
}

export class HookDataModelResult {
    id: number;
    deviceId: string;
}