"use strict";

var _ = require('lodash');

export function NotificationsService(server){
    this.system = server.system;
}

NotificationsService.prototype.push = function(request, type, message){
    if(request.query.silent && request.query.silent === true){
        return;
    }
    return this.system.notificationService.push(type, message);
};