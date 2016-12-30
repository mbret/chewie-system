"use strict";

var _ = require('lodash');
var validator = require("validator");

export function UsersService(system){
    this.system = system;
}

UsersService.prototype.formatUser = function(user){
    return _.merge(user, {});
};