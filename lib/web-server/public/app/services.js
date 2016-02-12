'use strict';

angular.module('myBuddy')

    .service('apiService', function($http, APP_CONFIG, notificationService){

        var user = {
            getExternalStatus: function(){
                return get('/users/external-services-status');
            }
        };

        return {
            ping: ping,
            speak: speak,
            shutdown: shutdown,
            restart: restart,
            systemInfo: systemInfo,
            get: get,
            put: put,
            post: post,
            postVoiceCommand: postVoiceCommand,
            getTaskTriggers: getTaskTriggers,
            getConfig: getConfig,
            updateConfig: updateConfig,
            user: user
        };

        function shutdown(){
            return this.get(APP_CONFIG.apiUri + '/shutdown', {});
        }

        function restart(){
            return this.get(APP_CONFIG.apiUri + '/restart', {});
        }

        function speak(text){
            this.post(APP_CONFIG.apiUri + '/speak', {text: text});
        }

        function ping(){
            this.get(APP_CONFIG.apiUri + '/ping');
        }

        function systemInfo(){
            return $http.get(APP_CONFIG.apiUri + '/system', {}).then(function(response){
                return response.data;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }

        function get(url, options){
            url = APP_CONFIG.apiUri + url;
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
            url = APP_CONFIG.apiUri + url;
            console.log('api call PUT', url, data);
            return $http.put(url, data).then(function(response){
                console.log('api call response for', url, response.data);
                return response.data;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }

        function post(url, data){
            console.log('api call POST', url, data);
            return $http.post(url, data).then(function(response){
                console.log('api call response for', url, response.data);
                return response.data;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }

        function postVoiceCommand(text){
            return this.post(APP_CONFIG.apiUri + '/voice-command', { text: text, type: 'text' });
        }

        function getTaskTriggers(){
            return this.get(APP_CONFIG.apiUri + '/task-triggers', {});
        }

        function getConfig(){

        }

        function updateConfig(config){
            return this.put('/config', config);
        }
    })

    .service('userService', function(apiService){

        return {
            fetchUser: fetchUser,
            updateUsersConfig: updateUsersConfig
        };

        function updateUsersConfig(config){
            return apiService.put('/users/config', config);
        }

        /**
         * Fetch user.
         * @param useCache
         */
        function fetchUser(useCache){
            if(!useCache){
                useCache = false;
            }

            return apiService.get('/users/current').then(function(data){
                return data;
            });
        }
    })

    .service('messagesAdaptersService', function messagesAdaptersService($http, APP_CONFIG, apiService){
        return {
            getActions: getActions,
            get: get,
        };

        function getActions(){
            return apiService.get(APP_CONFIG.apiUri + '/messages-adapters/actions', {});
        }

        function get(id){
            return apiService.get(APP_CONFIG.apiUri + '/messages-adapters/' + id, {});
        }
    })

    .service('pluginsService', function pluginsService($http, APP_CONFIG, apiService){
        return {
            getPlugins: getPlugins,
            getCoreModules: getCoreModules,
            getCoreModule: getCoreModule,
            updateCoreModuleOptions: updateCoreModuleOptions,
            updateMessageAdapterOptions: updateMessageAdapterOptions,
        };

        function getPlugins(){
            return $http.get(APP_CONFIG.apiUri + '/plugins', {}).then(function(response){
                return response.data;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }

        function getCoreModules(){
            return apiService.get(APP_CONFIG.apiUri + '/core-modules', {});
        }

        function getCoreModule(id){
            return apiService.get(APP_CONFIG.apiUri + '/core-modules/:id'.replace(':id', id), {});
        }

        function updateCoreModuleOptions(id, options){
            return apiService.put(APP_CONFIG.apiUri + '/core-modules/:id/options'.replace(':id', id), options);
        }

        function updateMessageAdapterOptions(pluginId, id, options){
            return apiService.put(APP_CONFIG.apiUri + '/plugins/:plugin/message-adapters/:id/options'.replace(':plugin', pluginId).replace(':id', id), options);
        }
    })

    .service('notificationService', function notificationService(toastr){
        return toastr;
    });