(function() {
    'use strict';

    angular.module('components.screens', [])

    .config(function($stateProvider) {

        $stateProvider.state('screens', {
            url: '/my-screens',
            abstract: true,
            template: '<ui-view></ui-view>'
        });

        $stateProvider

            // route for the about page
            .state('dashboard.screens', {
                url: '/screens',
                abstract: true,
                controller: 'ScreensController',
                templateUrl: '/app/components/screens/index.html'
            })

            .state('dashboard.screens.list', {
                url: '/list',
                controller: 'ScreensListController',
                templateUrl: '/app/components/screens/list.html'
            })

            .state('dashboard.screens.new', {
                url: '/new',
                controller: 'ScreensCreateController',
                templateUrl: '/app/components/screens/new.html'
            })
    });
})();