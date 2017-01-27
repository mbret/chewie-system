'use strict';

angular
    .module('components.tasks')

    .service('tasksService', function($http, APP_CONFIG, sharedApiService){
        return {
            //create: create,
            getAll: getAll,
            remove: remove,
            updateModuleOptions: updateModuleOptions,
        };


        function getAll(){
            return sharedApiService.get('/tasks', {});
        }

        function remove(taskId){
            return sharedApiService.delete('/tasks/:id'.replace(':id', taskId));
        }

        function updateModuleOptions(id, options){
            return sharedApiService.put('/users-modules/:id/options'.replace(':id', id), options);
        }
    });