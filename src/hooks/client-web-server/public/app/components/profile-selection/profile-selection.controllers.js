(function(){
    'use strict';

    function controller($rootScope, $scope, sharedApiService, userService, $window, $state, localStorage){
        $rootScope.bodyClasses = 'gray-bg';
        localStorage.removeItem("selectedProfile");

        // fetch and fill user profiles
        sharedApiService.get("/users").then(function(data) {
            $scope.users = data;
        });

        $scope.selectProfile = function(profile) {
            // It's important to not keep profile in storage as a page reload
            // should redirect to profile selection page
            // The only way to make it persistant is to set it in configuration
            localStorage.setObject("selectedProfile", profile);
            $state.go("signin");
        };
    }

    angular
        .module("chewie.components.profileSelection")
        .controller("ComponentsProfileSelectionIndexController", controller);
})();