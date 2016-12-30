"use strict";
const notifications_formatter_1 = require("./notifications-formatter");
class EventsWatcher {
    constructor(server) {
        this.server = server;
        this.formatter = new notifications_formatter_1.NotificationsFormatter();
    }
    watch() {
        let self = this;
        this.server.on("notifications:created", function (created) {
            self.server.io.emit("events", {
                event: "notification",
                data: self.formatter.format(created)
            });
        });
    }
}
exports.EventsWatcher = EventsWatcher;
