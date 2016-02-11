/**
 * Created by maxime on 11/15/2015.
 */
angular
    .module('myBuddy')
    .service('tasksService', function($http, APP_CONFIG, apiService){
        return {
            create: create,
            getAll: getAll,
            remove: remove
        };

        /**
         *
         * @param task
         * @param type
         * @param moduleName
         * @returns {*|Promise.<T>}
         */
        function create(task, type, moduleName){
            return apiService.post(APP_CONFIG.apiUri + '/users-modules/' + moduleName + '/tasks', { task: task, type: type });
        }

        function getAll(){
            return apiService.get(APP_CONFIG.apiUri + '/users-modules', {}).then(function(response){
                return response;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }

        function remove(taskId){
            var url = APP_CONFIG.apiUri + '/tasks/:id'.replace(':id', taskId);
            console.log('api call DELETE', url);
            return $http.delete(url).then(function(response){
                return response.data;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }
    });