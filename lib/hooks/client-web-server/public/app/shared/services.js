'use strict';

angular.module('app.shared')

    .provider("sharedApiService", function ApiServiceProvider() {

        var apiUri = "";

        this.setApiUri = function(uri) {
            apiUri = uri;
        };

        this.$get = function($http){

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
                return $http.get(apiUri + '/system', {}).then(function(response){
                    return response.data;
                }, function(err){
                    console.error(err);
                    return Promise.reject();
                });
            }

            function get(url, params){
                url = apiUri + url;
                console.info('api call GET', url);
                return $http.get(url, {params: params}).then(function(response){
                    console.info('api call response for', url, response.data);
                    return response.data;
                }, function(err){
                    _handleErrors(err);
                    return Promise.reject(err);
                });
            }

            function put(url, data){
                url = apiUri + url;
                console.info('api call PUT', url, data);
                return $http.put(url, data).then(function(response){
                    console.log('api call response for', url, response.data);
                    return response.data;
                }, function(err){
                    _handleErrors(err);
                    return Promise.reject();
                });
            }

            function remove(url, data){
                url = apiUri + url;
                console.info('api call DELETE', url, data);
                return $http.delete(url, data).then(function(response){
                    console.info('api call response for DELETE', url, response.data);
                    return response.data;
                }, function(err){
                    _handleErrors(err);
                    return Promise.reject();
                });
            }

            function post(url, data){
                url = apiUri + url;
                console.info('api call POST', url, data);
                return $http.post(url, data).then(function(response){
                    console.info('api call response for', url, response.data);
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

            function _handleErrors(err){
                //notificationService.error('Oups something went wrong');
            }
        }
    })

    /**
     * Local api service.
     */
    .provider("apiService", function() {
        this.$get = function($http, $log, APP_CONFIG){

            return {
                get: query.bind(this, "get"),
                put: query.bind(this, "put"),
                post: query.bind(this, "post"),
                delete: query.bind(this, "delete")
            };

            function query(method, url, data) {
                $log.info("%s %s", method.toUpperCase(), APP_CONFIG.apiUrl + url);
                return $http({
                    method: method,
                    url: url,
                    data: data
                });
            }
        }
    })

    .service('userService', function(sharedApiService){

        return {
            fetchUser: fetchUser,
            updateUsersConfig: updateUsersConfig,
            getProfileImageUrl: getProfileImageUrl,
        };

        function updateUsersConfig(config){
            return sharedApiService.put('/users/config', config);
        }

        /**
         * Fetch user.
         * @param useCache
         */
        function fetchUser(useCache){
            if(!useCache){
                useCache = false;
            }

            return sharedApiService.get('/users/current').then(function(data){
                return data;
            });
        }

        function getProfileImageUrl(profileImage, size) {
            if (size) {
                size = "_" + size;
            }
            return "resources/img/" + 'profile_default' + (size || "") + '.gif';
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