(function() {
    'use strict';

    angular.module('screens.default', [])

        .config(function($stateProvider) {

            $stateProvider.state('screens.view', {
                url: '/view/:id',
                controller: 'ScreensDefaultIndexController',
                templateUrl: '/app/screens/default/index.html'
            });
        })

        .run(function(screensService, $rootScope){

            screensService.screens.push({
                name: 'default',
                description: 'Default board',
            });

            $rootScope.screenName = 'default';
        });
})();