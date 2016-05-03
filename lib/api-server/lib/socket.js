'use strict';

module.exports = function(server, socketServer){

    socketServer.on('connection', function (socket) {

        function onNewNotification(notification){
            server.logger.debug('One notification to send', notification);
            socket.emit('notification:new', notification);
        }

        function onProfileStoppedCompleted(){
            socket.emit('profile:stopped:completed');
        }

        function onProfileStartedCompleted(){
            socket.emit('profile:start:complete');
        }

        function onUserUpdated(id){
            socket.emit('user:updated', id);
        }

        // Listen for new notifications
        // Then pass notification through socket
        server.system.on('notification:new', onNewNotification);
        server.system.profileManager.on('profile:stopped:completed', onProfileStoppedCompleted);
        server.system.profileManager.on('profile:start:complete', onProfileStartedCompleted);
        server.system.bus.on('user:updated', onUserUpdated);

        // Once socket is disconnected remove all the current listener for this user
        // avoid listeners leak
        socket.on('disconnect', function(){
            server.system.removeListener('notification:new', onNewNotification);
            server.system.profileManager.removeListener('profile:stopped:completed', onProfileStoppedCompleted);
            server.system.profileManager.removeListener('profile:start:complete', onProfileStartedCompleted);
            server.system.bus.removeListener('user:updated', onUserUpdated);
        });
    });
};