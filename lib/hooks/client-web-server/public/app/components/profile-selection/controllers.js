(function(){
    'use strict';

    var module = angular.module(angular.module('app.buddy').componentsNamespace + ".profileSelection");

    module
        .controller(module.name + '.IndexController', function($rootScope, $scope, sharedApiService, userService, $window, $state, $timeout){
            $rootScope.bodyClasses = 'gray-bg';

            sharedApiService.get("/users").then(function(data) {
                $scope.users = data;

                // @todo dev bypass (admin with id 1)
                $timeout(function(){
                    $scope.selectProfile(data[0]);
                }, 1);
            });

            $scope.selectProfile = function(profile) {
                // It's important to not keep profile in storage as a page reload
                // should redirect to profile selection page
                // The only way to make it persistant is to set it in configuration
                $rootScope.selectedProfile = profile;
                $state.go("signin");
            };
        });
})();