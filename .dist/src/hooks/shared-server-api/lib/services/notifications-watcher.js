"use strict";
var notifications_formatter_1 = require("./notifications-formatter");
var EventsWatcher = (function () {
    function EventsWatcher(server) {
        this.server = server;
        this.formatter = new notifications_formatter_1.NotificationsFormatter();
    }
    EventsWatcher.prototype.watch = function () {
        var self = this;
        this.server.on("notifications:created", function (created) {
            self.server.io.emit("notifications:created", self.formatter.format(created));
        });
    };
    return EventsWatcher;
}());
exports.EventsWatcher = EventsWatcher;
//# sourceMappingURL=notifications-watcher.js.map