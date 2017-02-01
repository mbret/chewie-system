"use strict";
var _ = require('lodash');
var validator = require("validator");
function UsersService(server) {
    this.system = server.system;
}
exports.UsersService = UsersService;
UsersService.prototype.formatUser = function (user) {
    return _.merge(user, {});
};
//# sourceMappingURL=users-service.js.map