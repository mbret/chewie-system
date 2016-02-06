'use strict';

angular.module('myBuddy')

    .service('apiService', function($http, CONFIG, notificationService){

        return {
            ping: ping,
            speak: speak,
            shutdown: shutdown,
            restart: restart,
            systemInfo: systemInfo,
            get: get,
            put: put,
            post: post,
            postVoiceCommand: postVoiceCommand
        };

        function shutdown(){
            return this.get(CONFIG.apiUri + '/shutdown', {});
        }

        function restart(){
            return this.get(CONFIG.apiUri + '/restart', {});
        }

        function speak(text){
            this.post(CONFIG.apiUri + '/speak', {text: text});
        }

        function ping(){
            this.get(CONFIG.apiUri + '/ping');
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

        function post(url, data){
            console.log('api call POST', url);
            return $http.post(url, data).then(function(response){
                console.log('api call response for', url, response.data);
                return response.data;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }

        function postVoiceCommand(text){
            this.post(CONFIG.apiUri + '/voice-command', { text: text, type: 'text' });
        }
    })

    .service('messagesAdaptersService', function messagesAdaptersService($http, CONFIG, apiService){
        return {
            getActions: getActions,
            get: get,
        };

        function getActions(){
            return apiService.get(CONFIG.apiUri + '/messages-adapters/actions', {});
        }

        function get(id){
            return apiService.get(CONFIG.apiUri + '/messages-adapters/' + id, {});
        }
    })

    .service('pluginsService', function pluginsService($http, CONFIG, apiService){
        return {
            getPlugins: getPlugins,
            getCoreModules: getCoreModules,
            getCoreModule: getCoreModule,
            updateCoreModuleOptions: updateCoreModuleOptions,
            updateMessageAdapterOptions: updateMessageAdapterOptions,
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

        function updateMessageAdapterOptions(pluginId, id, options){
            return apiService.put(CONFIG.apiUri + '/plugins/:plugin/message-adapters/:id/options'.replace(':plugin', pluginId).replace(':id', id), options);
        }
    })

    .service('notificationService', function notificationService(toastr){
        return toastr;
    });