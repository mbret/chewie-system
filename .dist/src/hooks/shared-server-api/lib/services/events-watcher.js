"use strict";
const notifications_formatter_2 = require("./notifications-formatter");
class EventsWatcher {
    constructor(server) {
        this.server = server;
        this.formatter = new notifications_formatter_2.NotificationsFormatter();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EventsWatcher;
//# sourceMappingURL=events-watcher.js.map