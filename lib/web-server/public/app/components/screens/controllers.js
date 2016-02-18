(function(){
    'use strict';

    angular
        .module('components.screens')

        .controller('ScreensController', function($scope, APP_CONFIG){

        })

        .controller('ScreensListController', function($scope, APP_CONFIG, $state){

            $scope.screens = [1,2,3,4];

            //$scope.createNewScreen = function(){
            //    $state.go('dashboard.screens.new');
            //}
        });
})();