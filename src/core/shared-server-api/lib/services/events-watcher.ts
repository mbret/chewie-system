"use strict";
import {NotificationsFormatter} from "./notifications-formatter";
import SharedServerApiHook from "../server";

export default class EventsWatcher {

    server: SharedServerApiHook;
    formatter: NotificationsFormatter;

    constructor(server) {
        this.server = server;
        this.formatter = new NotificationsFormatter();
    }

    /**
     * @todo for now we watch all notifications and directly send it through socker. In futur we could have a facebook like system
     * that track the notifications seen, and who is concerned. The notifications table should only be used by the watcher and another table for notification should be used
     * to stack notification to see with delete on it when notification is seen
     */
    watch() {
        let self = this;

        // Notifications
        this.server.on("notifications:created", function(created) {
            self.server.io.emit("events", {
                event: "notification",
                data: self.formatter.format(created)
            });
        });
    }
}