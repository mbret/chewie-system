'use strict';
import * as Sequelize from "sequelize";
import * as uuid from "uuid";
import Base from "./base";
import * as _ from "lodash";

module.exports = function(sequelize, system){

    var Model = sequelize.define('logs',{
        level: Sequelize.STRING,
        message: Sequelize.STRING,
        meta: {
            type: Sequelize.TEXT,
            set: function (value) {
                this.setDataValue('meta', JSON.stringify(value));
            },
            get: function () {
                return JSON.parse(this.getDataValue('meta'));
            }
        }
    }, {
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        //indexes: [
        //    {
        //        name: 'level',
        //        fields: ['level']
        //    }
        //]
    });

    Model.toJSON = Base.toJSON;

    return Model;
};