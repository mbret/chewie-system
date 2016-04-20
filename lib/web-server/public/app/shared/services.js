'use strict';

angular.module('myBuddy')

    .config(function($httpProvider, $provide, $injector){
        $provide.factory('myHttpInterceptor', function(notificationService){
            return {
                'requestError': function(rejection) {
                    //console.log(rejection);
                },
                'responseError': function(rejection) {
                    if(rejection.status === -1){
                        notificationService.warning('Oups something went wrong!');
                        console.error('bad api endpoint');
                    }
                    console.error(rejection);
                    return Promise.reject(rejection);
                }
            }
        });
        $httpProvider.interceptors.push('myHttpInterceptor');
    })

    .service('apiService', function($http, APP_CONFIG, notificationService){

       return {
            ping: ping,
            speak: speak,
            shutdown: shutdown,
            restart: restart,
            systemInfo: systemInfo,
            get: get,
            put: put,
            post: post,
            delete: remove,
            postVoiceCommand: postVoiceCommand,
            getTaskTriggers: getTaskTriggers,
            getConfig: getConfig,
            updateConfig: updateConfig,
        };

        function shutdown(){
            return this.get('/shutdown', {});
        }

        function restart(){
            return this.get('/restart', {});
        }

        function speak(text){
            this.post('/speak', {text: text});
        }

        function ping(){
            this.get('/ping');
        }

        function systemInfo(){
            return $http.get(APP_CONFIG.apiUri + '/system', {}).then(function(response){
                return response.data;
            }, function(err){
                console.error(err);
                return Promise.reject();
            });
        }

        function get(url, params){
            url = APP_CONFIG.apiUri + url;
            console.log('api call GET', url);
            return $http.get(url, {params: params}).then(function(response){
                console.log('api call response for', url, response.data);
                return response.data;
            }, function(err){
                _handleErrors(err);
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
                _handleErrors(err);
                return Promise.reject();
            });
        }

        function remove(url, data){
            url = APP_CONFIG.apiUri + url;
            console.log('api call DELETE', url, data);
            return $http.delete(url, data).then(function(response){
                console.log('api call response for DELETE', url, response.data);
                return response.data;
            }, function(err){
                _handleErrors(err);
                return Promise.reject();
            });
        }

        function post(url, data){
            url = APP_CONFIG.apiUri + url;
            console.log('api call POST', url, data);
            return $http.post(url, data).then(function(response){
                console.log('api call response for', url, response.data);
                return response.data;
            }, function(err){
                _handleErrors(err);
                return Promise.reject(err);
            });
        }

        function postVoiceCommand(text){
            return this.post('/voice-command', { text: text, type: 'text' });
        }

        function getTaskTriggers(){
            return this.get('/task-triggers', {});
        }

        function getConfig(){

        }

        function updateConfig(config){
            return this.put('/config', config);
        }

        function _handleErrors(err){
            notificationService.error('Oups something went wrong');
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
            return apiService.get('/messages-adapters/actions', {});
        }

        function get(id){
            return apiService.get('/messages-adapters/' + id, {});
        }
    })

    .service('notificationService', function notificationService(toastr, _){

        return {
            warning: toastr.warning,
            info: toastr.info,
            success: toastr.success,
            error: toastr.error,
            formErrors: formErrors,
        };

        function formErrors(form){
            var message = 'Your form has some errors:';
            _.forEach(form.$error, function(errors, key){
                _.forEach(errors, function(field){
                    message += '<b>' + key + ': ' + field.$name;
                });
                console.log(error, key);
            });
        }
    })

    .factory('SweetAlert', [ '$rootScope', function ( $rootScope ) {

        var swal = window.swal;

        var self = {

            swal: function ( arg1, arg2, arg3 ) {
                $rootScope.$evalAsync(function(){
                    if( typeof(arg2) === 'function' ) {
                        swal( arg1, function(isConfirm){
                            $rootScope.$evalAsync( function(){
                                arg2(isConfirm);
                            });
                        }, arg3 );
                    } else {
                        swal( arg1, arg2, arg3 );
                    }
                });
            },
            success: function(title, message) {
                $rootScope.$evalAsync(function(){
                    swal( title, message, 'success' );
                });
            },
            error: function(title, message) {
                $rootScope.$evalAsync(function(){
                    swal( title, message, 'error' );
                });
            },
            warning: function(title, message) {
                $rootScope.$evalAsync(function(){
                    swal( title, message, 'warning' );
                });
            },
            info: function(title, message) {
                $rootScope.$evalAsync(function(){
                    swal( title, message, 'info' );
                });
            },
            showInputError: function(message) {
                $rootScope.$evalAsync(function(){
                    swal.showInputError( message );
                });
            },
            close: function() {
                $rootScope.$evalAsync(function(){
                    swal.close();
                });
            }
        };

        return self;
    }]);