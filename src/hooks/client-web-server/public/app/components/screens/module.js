(function() {
    'use strict';

    angular.module('components.screens', [])

    .config(function($stateProvider) {

        $stateProvider.state('screens', {
            url: '/my-screens',
            abstract: true,
            template: '<ui-view></ui-view>',
            resolve: {
                auth: function(authenticationService){
                    return authenticationService.resolveAuth();
                }
            }
        });

        $stateProvider.state('screens.view', {
            url: '/view',
            //controller: 'ScreensIndexController',
            abstract: true,
            template : '<ui-view></ui-view>',
        });

        $stateProvider

            // route for the about page
            .state('chewie.dashboard.screens', {
                url: '/screens',
                abstract: true,
                controller: 'ScreensController',
                templateUrl: '/app/components/screens/index.html'
            })

            .state('chewie.dashboard.screens.list', {
                url: '/list',
                controller: 'ScreensListController',
                templateUrl: '/app/components/screens/list.html'
            })

            .state('chewie.dashboard.screens.new', {
                url: '/new',
                controller: 'ScreensCreateController',
                templateUrl: '/app/components/screens/new.html'
            })
    });
})();