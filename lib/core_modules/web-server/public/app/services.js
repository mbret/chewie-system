'use strict';

angular.module('myBuddy')

    .service('apiService', function($http, CONFIG){
        return {
            shutdown: shutdown,
            restart: restart,
            systemInfo: systemInfo,
        };

        function shutdown(){
            return $http.get(CONFIG.apiUri + '/shutdown', {}).then(function(response){
                return response.data;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }

        function restart(){
            return $http.get(CONFIG.apiUri + '/restart', {}).then(function(response){
                return response.data;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }

        function systemInfo(){
            return $http.get(CONFIG.apiUri + '/system', {}).then(function(response){
                return response.data;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }
    })

    .service('messagesAdaptersService', function messagesAdaptersService($http, CONFIG){
        return {
            getActions: getActions,
            get: get,
            put: put
        };

        function getActions(){
            return $http.get(CONFIG.apiUri + '/adapters/actions', {}).then(function(response){
                return response.data;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }

        function get(id){
            return $http.get(CONFIG.apiUri + '/messages-adapters/' + id, {}).then(function(response){
                return response.data;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }

        function put(id, data){
            return $http.put(CONFIG.apiUri + '/messages-adapters/' + id, data).then(function(response){
                return;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }

    })

    .service('pluginsService', function pluginsService($http, CONFIG){
        return {
            getPlugins: getPlugins
        };

        function getPlugins(){
            return $http.get(CONFIG.apiUri + '/plugins', {}).then(function(response){
                return response.data;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }
    });