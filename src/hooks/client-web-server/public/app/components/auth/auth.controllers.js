(function(){
    'use strict';

    angular
        .module('components.auth')

        // http://jasonwatmore.com/post/2015/03/10/AngularJS-User-Registration-and-Login-Example.aspx
        .controller('SigninController', function($rootScope, $scope, APP_CONFIG, sharedApiService, notificationService, authenticationService, $timeout, $state, selectedProfile){
            $rootScope.bodyClasses = 'gray-bg';
            $scope.formData = {
                password: "admin"
            };
            $scope.user = selectedProfile;

            // @todo dev bypass
            // $timeout(function(){
            //     $scope.login();
            // }, 1);

            $scope.login = function() {
                authenticationService.login(selectedProfile.username, $scope.formData.password)
                    .then(function(){
                        notificationService.success('Logged in!');
                        $state.go('chewie.dashboard.home');
                    })
                    .catch(function(err){
                        if(err.status === 400){
                            notificationService.warning('Bad credentials');
                        }
                    });
            }
        })

        .controller('LogoutController', function($scope, APP_CONFIG, sharedApiService, notificationService, authenticationService, $state){
            authenticationService.logout()
                .then(function(){
                    notificationService.success('Logged out!');
                    $state.go('chewie.dashboard.home');
                })
                .catch(function() {
                    notificationService.error("Something went wrong!");
                });
        });
})();