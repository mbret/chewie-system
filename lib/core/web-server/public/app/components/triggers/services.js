'use strict';

angular.module('components.taskTriggers')

    .service('triggersService', function pluginsService($http, APP_CONFIG, apiService){

        return {
            fetchAll: fetchAll,
            fetchOne: fetchOne,
        };

        function fetchAll(){
            return apiService.get('/triggers');
        }

        function fetchOne(id){
            return apiService.get('/triggers/' + id);
        }
    });