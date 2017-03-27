'use strict';

import * as Sequelize from "sequelize";

export function define(sequelize) {
    return sequelize.define('systemConfig', {

            deviceId: {
                type: Sequelize.STRING,
                allowNull: false
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

export class SystemConfigStorageModel {
    id: number;
    deviceId: string;
    data: any;
}