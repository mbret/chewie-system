'use strict';

angular
    .module('components.tasks')

    .service('tasksService', function($http, APP_CONFIG, apiService){
        return {
            create: create,
            getAll: getAll,
            remove: remove,
            updateModuleOptions: updateModuleOptions,
        };

        /**
         *
         * @param task
         * @param type
         * @param moduleName
         * @returns {*|Promise.<T>}
         */
        function create(moduleId, task){
            return apiService.post('/users-modules/' + moduleId + '/tasks', task);
        }

        function getAll(){
            return apiService.get('/tasks', {});
        }

        function remove(taskId){
            return apiService.delete('/tasks/:id'.replace(':id', taskId));
        }

        function updateModuleOptions(id, options){
            return apiService.put('/users-modules/:id/options'.replace(':id', id), options);
        }
    });