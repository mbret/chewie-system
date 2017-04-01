'use strict';

import * as Sequelize from "sequelize";

export function define(sequelize) {
    return sequelize.define('info', {

            key: {
                type: Sequelize.STRING,
            },

            value: {
                type: Sequelize.STRING,
            },
        },
        {
            freezeTableName: true, // Model tableName will be the same as the model name
            validate: {}
        }
    );
}