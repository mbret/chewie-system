"use strict";
class NotificationsFormatter {
    format(data) {
        return {
            id: data.id,
            type: data.type,
            userId: data.userId,
            content: data.content
        };
    }
}
exports.NotificationsFormatter = NotificationsFormatter;
