"use strict";

export class NotificationsFormatter {
    format(data) {
        return {
            id: data.id,
            type: data.type,
            userId: data.userId,
            content: data.content
        };
    }
}