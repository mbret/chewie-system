(function(){
    'use strict';

    /**
     * http://jasonwatmore.com/post/2015/03/10/AngularJS-User-Registration-and-Login-Example.aspx
     * @param $rootScope
     * @param $scope
     * @param notificationService
     * @param authenticationService
     * @param $state
     * @param localStorage
     */
    function signin($rootScope, $scope, notificationService, authenticationService, $state, localStorage){
        $rootScope.bodyClasses = 'gray-bg';
        $scope.formData = {
            password: "admin"
        };
        // $scope.user = localStorage.getItem("selectedProfile");
        $scope.user = localStorage.getObject("selectedProfile");

        if (!$scope.user) {
            return $state.go("profileSelection");
        }

        $scope.login = function() {
            authenticationService.login($scope.user.username, $scope.formData.password)
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
    }

    function logout($scope, APP_CONFIG, sharedApiService, notificationService, authenticationService, $state){
        authenticationService.logout()
            .then(function(){
                notificationService.success('Logged out!');
                $state.go('chewie.dashboard.home');
            })
            .catch(function() {
                notificationService.error("Something went wrong!");
            });
    }

    angular
        .module('components.auth')
        .controller('SigninController', signin)
        .controller('LogoutController', logout);
})();