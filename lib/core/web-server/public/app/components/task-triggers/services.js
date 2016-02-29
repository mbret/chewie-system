'use strict';

angular.module('components.taskTriggers')

    .service('taskTriggersService', function pluginsService($http, APP_CONFIG, apiService){

        return {
            fetchAll: fetchAll,
        };

        function fetchAll(){
            return apiService.get('/task-triggers');
        }
    });