'use strict';

angular.module('components.auth')

    .factory('authenticationService', function($http, $window, apiService, user){
        var user = null;

        function AuthenticationService(){
            _init();
        }

        AuthenticationService.prototype.login = function(login, password){
            var self = this;
            return apiService
                .post('/auth/signin', {
                    login: login,
                    password: password
                })
                .then(function(data){
                    self.setUser(data);
                    _persisteData(data);
                    return data;
                });
        };

        AuthenticationService.prototype.logout = function(){
            return apiService.get('/auth/signout').then(function(){
                _erasePersistence();
                return Promise.resolve();
            });
        };

        AuthenticationService.prototype.getUser = function(){
            return user;
        };

        AuthenticationService.prototype.setUser = function(data){
            user = data;
        };

        AuthenticationService.prototype.isAuth = function(){
            return !(user === null)
        };

        AuthenticationService.prototype.resolveAuth = function(){
            if(this.isAuth()){
                return Promise.resolve(this);
            }
            return Promise.reject({code: 'UNAUTHENTICATED'});
        };

        function _persisteData(data){
            $window.sessionStorage["user"] = data.id;
        }

        function _erasePersistence(){
            delete $window.sessionStorage["user"];
        }

        function _init(){
            console.log('authenticationService.init');
            if ($window.sessionStorage["userInfo"]) {
                this.setUser(JSON.parse($window.sessionStorage["user"]));
                console.log('authenticationService userInfo found', this.getUser());
            }
        }

        return new AuthenticationService();
    });