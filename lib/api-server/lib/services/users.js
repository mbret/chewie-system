"use strict";

var _ = require('lodash');
var validator = require("validator");

function UsersService(system){
    this.system = system;
}

UsersService.prototype.formatUser = function(user){
    return _.merge(user, {
        roleLabel: this.system.configHandler.getConfig().users.rolesLabel.get(user.role)
    });
};

module.exports = UsersService;