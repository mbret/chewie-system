"use strict";
var _ = require('lodash');
var validator = require("validator");
function UsersService(system) {
    this.system = system;
}
exports.UsersService = UsersService;
UsersService.prototype.formatUser = function (user) {
    return _.merge(user, {
        roleLabel: this.system.config.users.rolesLabel.get(user.role)
    });
};
