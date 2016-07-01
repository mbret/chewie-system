(function(){
    'use strict';

    var module = angular.module(angular.module('app.buddy').componentsNamespace + ".profileSelection");

    module
        .controller(module.name + '.IndexController', function($rootScope, $scope, apiService, userService, $window, $state, $timeout){
            $rootScope.bodyClasses = 'gray-bg';

            // fetch profiles
            apiService.get("/users").then(function(data) {
                //$scope.profiles = data.map(function(entry) {
                //    return {
                //        id: entry.id,
                //        username: entry.username,
                //        profileImage: entry.profileImage,
                //        displayName: (entry.firstName || entry) + " " + (entry.lastName || "") + " (" + entry.username + ")",
                //        profileImageUrl: userService.getProfileImageUrl(entry.profileImage)
                //    };
                //});

                $scope.users = data;
                // @todo dev bypass (admin with id 1)
                // $timeout(function(){
                //     $scope.selectProfile(data[0].username);
                // }, 1);
            });

            $scope.selectProfile = function(username) {
                // It's important to not keep profile in storage as a page reload
                // should redirect to profile selection page
                // The only way to make it persistant is to set it in configuration
                $rootScope.selectedProfile = username;
                $state.go("signin");
            };
        });
})();