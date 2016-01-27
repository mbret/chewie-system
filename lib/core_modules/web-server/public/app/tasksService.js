/**
 * Created by maxime on 11/15/2015.
 */
angular
    .module('myBuddy')
    .service('tasksService', function($http, CONFIG){
        return {
            create: create,
            getAll: getAll
        };

        function create(task, type, moduleName){
            return $http.post(CONFIG.apiUri + '/users-modules/' + moduleName + '/tasks', { task: task, type: type }).then(function(response){
                return response;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }

        function getAll(){
            return $http.get(CONFIG.apiUri + '/users-modules', {}).then(function(response){
                return response;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }
    });