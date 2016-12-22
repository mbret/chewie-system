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
        function onNewRuntimeTask(execution) {
            socket.emit("runtime:task-execution:new", server.services.taskService.taskExecutionToJson(execution));
            emitRuntimeTaskUpdate();
        }
        function onDeleteRuntimeTask(executionId) {
            socket.emit("runtime:task-execution:delete", executionId);
            emitRuntimeTaskUpdate();
        }
        function emitRuntimeTaskUpdate() {
            let tasks = [];
            server.system.runtime.executingTasks.forEach(function (tmp) {
                tasks.push(tmp);
            });
            socket.emit("runtime:executing-tasks:update", server.services.taskService.taskExecutionToJson(tasks));
        }
        server.system.on("runtime:task-execution:new", onNewRuntimeTask);
        server.system.on("runtime:task-execution:delete", onDeleteRuntimeTask);
        server.system.runtime.profileManager.on('profile:stopped:completed', onProfileStoppedCompleted);
        server.system.on('profile:start:complete', onProfileStartedCompleted);
        socket.on('disconnect', function () {
            server.system.removeListener("runtime:task-execution:new", onNewRuntimeTask);
            server.system.removeListener("runtime:task-execution:new", onDeleteRuntimeTask);
            server.system.runtime.profileManager.removeListener('profile:stopped:completed', onProfileStoppedCompleted);
            server.system.runtime.profileManager.removeListener('profile:start:complete', onProfileStartedCompleted);
        });
    });
};
