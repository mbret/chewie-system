'use strict';

angular.module('myBuddy')

    .service('apiService', function($http, CONFIG){

        return {
            shutdown: shutdown,
            restart: restart,
            systemInfo: systemInfo,
            get: get,
            put: put
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

        function get(url, options){
            console.log('api call GET', url);
            return $http.get(url, options).then(function(response){
                console.log('api call response for', url, response.data);
                return response.data;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }

        function put(url, data){
            console.log('api call PUT', url);
            return $http.put(url, data).then(function(response){
                console.log('api call response for', url, response.data);
                return response.data;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }
    })

    .service('messagesAdaptersService', function messagesAdaptersService($http, CONFIG, apiService){
        return {
            getActions: getActions,
            get: get,
            put: put
        };

        function getActions(){
            return apiService.get(CONFIG.apiUri + '/messages-adapters/actions', {});
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

    .service('pluginsService', function pluginsService($http, CONFIG, apiService){
        return {
            getPlugins: getPlugins,
            getCoreModules: getCoreModules,
            getCoreModule: getCoreModule,
            updateCoreModuleOptions: updateCoreModuleOptions,
        };

        function getPlugins(){
            return $http.get(CONFIG.apiUri + '/plugins', {}).then(function(response){
                return response.data;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }

        function getCoreModules(){
            return apiService.get(CONFIG.apiUri + '/core-modules', {});
        }

        function getCoreModule(id){
            return apiService.get(CONFIG.apiUri + '/core-modules/:id'.replace(':id', id), {});
        }

        function updateCoreModuleOptions(id, options){
            return apiService.put(CONFIG.apiUri + '/core-modules/:id/options'.replace(':id', id), options);
        }
    })

    .service('notificationService', function notificationService(toastr){
        return toastr;
    });