"use strict";

var _ = require('lodash');
var validator = require("validator");

export function UsersService(server){
    this.system = server.system;
}

UsersService.prototype.formatUser = function(user){
    return _.merge(user, {});
};