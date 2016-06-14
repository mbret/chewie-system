(function() {
    'use strict';

    angular.module('screens.default', [])

        .config(function($stateProvider) {

            $stateProvider.state('screens.view.default', {
                url: '/default',
                controller: 'ScreensDefaultIndexController',
                templateUrl: '/app/screens/default/index.html'
            });

            $stateProvider.state('"screens.default', {
                url: "/default",
                template: "<ui-view></ui-view>",
                abstract: true
            });

            $stateProvider.state('"screens.default.message', {
                url: "/coucou",
                templateUrl: "/app/screens/default/message.html"
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