"use strict";
module.exports = function (server, socketServer) {
    socketServer.on('connection', function (socket) {
        function onProfileStoppedCompleted() {
            socket.emit('profile:stopped:completed');
        }
        function onProfileStartedCompleted() {
            socket.emit('profile:start:complete');
        }
        function onUserUpdated(id) {
            socket.emit('user:updated', id);
        }
        server.system.runtime.profileManager.on('profile:stopped:completed', onProfileStoppedCompleted);
        server.system.on('profile:start:complete', onProfileStartedCompleted);
        socket.on('disconnect', function () {
            server.system.runtime.profileManager.removeListener('profile:stopped:completed', onProfileStoppedCompleted);
            server.system.runtime.profileManager.removeListener('profile:start:complete', onProfileStartedCompleted);
        });
    });
    socketServer
        .on("error", function (err) {
        server.logger.error("Error on server socket", err);
    });
};
