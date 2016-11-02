(function(){
    'use strict';

    angular
        .module('components.screens')

        .controller('ScreensController', function($scope, APP_CONFIG){

        })

        .controller('ScreensListController', function($scope, APP_CONFIG, $state, _, screensService){

            $scope.screens = screensService.screens;

            //_.forEach(user.config.screens, function(screen){
            //    $scope.screens.push(screen);
            //});
        })

        .controller('ScreensCreateController', function($scope, APP_CONFIG, $state, user, _){

            $scope.screen = {
                name: null,
                description: null
            };

            $scope.submitForm = function () {
                if (!$scope.newForm.$valid) {
                    $scope.newForm.submitted = true;
                }
                else{

                }
            };
        })

        .controller('ScreensIndexController', function($scope, APP_CONFIG, $state, _, screensService, notificationService, googleApi, apiService, util, auth, OAuth, $http){

            console.log("coucou");
        });
})();