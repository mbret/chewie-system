'use strict';

angular.module('components.auth')

    .provider('authenticationService', function(){

        var userModel = null;

        this.setUserModel = function(model){
            userModel = model;
        };

        this.$get = function($http, $window, apiService, $rootScope){

            function AuthenticationService(){
                this.user = null;
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
                        var user = data.data;
                        self.setUser(user);
                        _persisteData(user);

                        $rootScope.$emit('auth:login:success');
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
                return this.user;
            };

            AuthenticationService.prototype.setUser = function(data){
                this.user = new userModel(data);
            };

            AuthenticationService.prototype.isAuth = function(){
                return !(this.user === null)
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
        };
    });