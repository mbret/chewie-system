"use strict";

var _ = require('lodash');

function NotificationsService(system){
    this.system = system;
}

NotificationsService.prototype.push = function(request, type, message){
    if(request.query.silent && request.query.silent === true){
        return;
    }
    return this.system.notificationService.push(type, message);
};

module.exports = NotificationsService;