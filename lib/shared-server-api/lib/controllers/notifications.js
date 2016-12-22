'use strict';
const notifications_formatter_1 = require("../services/notifications-formatter");
let _ = require('lodash');
let validator = require('validator');
let util = require('util');
let request = require("request");
module.exports = function (server, router) {
    router.post("/notifications", function (req, res) {
        let NotificationDao = server.orm.models.Notification;
        let formatter = new notifications_formatter_1.NotificationsFormatter();
        let userId = req.body.userId;
        let type = req.body.type;
        let content = req.body.content;
        let options = req.body.options;
        let errors = {};
        if (userId !== undefined && (userId !== null || !validator.isInt(userId))) {
            errors["userId"] = "Invalid";
        }
        if (_.size(errors) > 0) {
            return res.badRequest({ errors: errors });
        }
        if (userId) {
            userId = parseInt(userId);
        }
        type = type || "info";
        options = _.merge({
            seen: false
        }, options || {});
        let plugin = {
            userId: userId,
            type: type,
            content: content,
            options
        };
        return NotificationDao.create(plugin)
            .then(function (created) {
            server.logger.verbose("Notification %s created", created.id);
            server.emit("notifications:created", created);
            return res.created(formatter.format(created));
        })
            .catch(res.serverError);
    });
    return router;
};
