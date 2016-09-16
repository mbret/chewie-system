import {Task} from "../../core/plugins/tasks/task";
import {TaskExecution} from "../../core/plugins/tasks/task-execution";

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

        function onNewRuntimeTask(execution: TaskExecution) {
            socket.emit("runtime:task-execution:new", server.services.taskService.taskExecutionToJson(execution));
            emitRuntimeTaskUpdate();
        }

        function onDeleteRuntimeTask(executionId: string) {
            socket.emit("runtime:task-execution:delete", executionId);
            emitRuntimeTaskUpdate();
        }

        function emitRuntimeTaskUpdate() {
            var tasks = [];
            server.system.executingTasks.forEach(function(tmp: TaskExecution) {
                tasks.push(tmp);
            });
            socket.emit("runtime:executing-tasks:update", server.services.taskService.taskExecutionToJson(tasks));
        }

        // Listen for new notifications
        // Then pass notification through socket
        server.system.on('notification:new', onNewNotification);
        server.system.on("runtime:task-execution:new", onNewRuntimeTask);
        server.system.on("runtime:task-execution:delete", onDeleteRuntimeTask);
        server.system.runtimeHelper.profile.on('profile:stopped:completed', onProfileStoppedCompleted);
        server.system.runtimeHelper.profile.on('profile:start:complete', onProfileStartedCompleted);
        server.system.bus.on('user:updated', onUserUpdated);

        // Once socket is disconnected remove all the current listener for this user
        // avoid listeners leak
        socket.on('disconnect', function(){
            server.system.removeListener('notification:new', onNewNotification);
            server.system.removeListener("runtime:task-execution:new", onNewRuntimeTask);
            server.system.removeListener("runtime:task-execution:new", onDeleteRuntimeTask);
            server.system.runtimeHelper.profile.removeListener('profile:stopped:completed', onProfileStoppedCompleted);
            server.system.runtimeHelper.profile.removeListener('profile:start:complete', onProfileStartedCompleted);
            server.system.bus.removeListener('user:updated', onUserUpdated);
        });
    });
};