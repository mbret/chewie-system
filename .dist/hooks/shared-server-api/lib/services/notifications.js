"use strict";
var _ = require('lodash');
function NotificationsService(system) {
    this.system = system;
}
exports.NotificationsService = NotificationsService;
NotificationsService.prototype.push = function (request, type, message) {
    if (request.query.silent && request.query.silent === true) {
        return;
    }
    return this.system.notificationService.push(type, message);
};
//# sourceMappingURL=notifications.js.map