(function(){
    'use strict';

    var module = angular
        .module('components.auth')

        // http://jasonwatmore.com/post/2015/03/10/AngularJS-User-Registration-and-Login-Example.aspx
        .controller('SigninController', function($rootScope, $scope, APP_CONFIG, apiService, notificationService, authenticationService, $timeout, $state, user){
            $rootScope.bodyClasses = 'gray-bg';
            $scope.formData = {
                username: "admin",
                password: "admin"
            };

            console.log(module);
            //$timeout(function(){
            //    $scope.login();
            //}, 500);

            // Clear actual credentials
            authenticationService.clearCredentials();

            $scope.login = function() {
                authenticationService.login($scope.formData.username, $scope.formData.password)
                    .then(function(){
                        notificationService.success('Logged in!');
                        $state.go('dashboard.home');
                    })
                    .catch(function(err){
                        if(err.status === 400){
                            notificationService.warning('Bad credentials');
                        }
                    });
            }
        })

        .controller('SignoutController', function($scope, APP_CONFIG, apiService, notificationService, authenticationService, $timeout, $state, user){
            authenticationService.logout().then(function(){
                notificationService.success('Logged out!');
                //$state.go('dashboard.home');
            })
        });
})();