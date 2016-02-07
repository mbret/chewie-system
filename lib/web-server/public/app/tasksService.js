/**
 * Created by maxime on 11/15/2015.
 */
angular
    .module('myBuddy')
    .service('tasksService', function($http, CONFIG, apiService){
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
            return apiService.post(CONFIG.apiUri + '/users-modules/' + moduleName + '/tasks', { task: task, type: type });
        }

        function getAll(){
            console.log('api call', CONFIG.apiUri + '/users-modules');
            return $http.get(CONFIG.apiUri + '/users-modules', {}).then(function(response){
                return response;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }

        function remove(taskId){
            var url = CONFIG.apiUri + '/tasks/:id'.replace(':id', taskId);
            console.log('api call DELETE', url);
            return $http.delete(url).then(function(response){
                return response.data;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }
    });