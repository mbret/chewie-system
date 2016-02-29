'use strict';

angular
    .module('myBuddy')
    .service('tasksService', function($http, APP_CONFIG, apiService){
        return {
            create: create,
            getAll: getAll,
            remove: remove,
            getModule: getModule,
            updateModuleOptions: updateModuleOptions,
        };

        /**
         *
         * @param task
         * @param type
         * @param moduleName
         * @returns {*|Promise.<T>}
         */
        function create(task, type, moduleName){
            return apiService.post('/users-modules/' + moduleName + '/tasks', { task: task, type: type });
        }

        function getAll(){
            return apiService.get('/users-modules', {});
        }

        function getModule(id){
            return apiService.get('/users-modules/' + id);
        }

        function remove(taskId){
            return apiService.delete('/tasks/:id'.replace(':id', taskId));
        }

        function updateModuleOptions(id, options){
            return apiService.put('/users-modules/:id/options'.replace(':id', id), options);
        }
    });