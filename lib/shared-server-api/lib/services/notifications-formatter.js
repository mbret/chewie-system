"use strict";
var NotificationsFormatter = (function () {
    function NotificationsFormatter() {
    }
    NotificationsFormatter.prototype.format = function (data) {
        return {
            id: data.id,
            type: data.type,
            userId: data.userId,
            content: data.content
        };
    };
    return NotificationsFormatter;
}());
exports.NotificationsFormatter = NotificationsFormatter;
