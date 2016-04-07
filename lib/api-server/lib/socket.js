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
            socket.emit('profile:started:completed');
        }

        // Listen for new notifications
        // Then pass notification through socket
        server.system.on('notification:new', onNewNotification);
        server.system.profileManager.on('profile:stopped:completed', onProfileStoppedCompleted);
        server.system.profileManager.on('profile:started:completed', onProfileStartedCompleted);

        // Once socket is disconnected remove all the current listener for this user
        // avoid listeners leak
        socket.on('disconnect', function(){
            server.system.removeListener('notification:new', onNewNotification);
            server.system.profileManager.removeListener('profile:stopped:completed', onProfileStoppedCompleted);
            server.system.profileManager.removeListener('profile:started:completed', onProfileStartedCompleted);
        });
    });
};