"use strict";
var notifications_formatter_1 = require("./notifications-formatter");
var EventsWatcher = (function () {
    function EventsWatcher(server) {
        this.server = server;
        this.formatter = new notifications_formatter_1.NotificationsFormatter();
    }
    /**
     * @todo for now we watch all notifications and directly send it through socker. In futur we could have a facebook like system
     * that track the notifications seen, and who is concerned. The notifications table should only be used by the watcher and another table for notification should be used
     * to stack notification to see with delete on it when notification is seen
     */
    EventsWatcher.prototype.watch = function () {
        var self = this;
        this.server.on("notifications:created", function (created) {
            self.server.io.emit("notifications:created", self.formatter.format(created));
        });
    };
    return EventsWatcher;
}());
exports.EventsWatcher = EventsWatcher;
