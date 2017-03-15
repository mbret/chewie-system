(function() {
    'use strict';

    angular.module('components.hooks', [])

    .config(function($stateProvider) {

        $stateProvider

            // route for the about page
            .state('dashboard.hooks', {
                url: '/hooks',
                abstract: true,
                controller: 'ModulesController',
                templateUrl: '/app/components/hooks/index.html'
            })

            .state('dashboard.hooks.list', {
                url: '/list',
                controller: 'HooksListController',
                templateUrl: '/app/components/hooks/list.html'
            })

            .state('dashboard.hooks.config', {
                url: '/:id/configuration',
                templateUrl: '/app/components/hooks/config.html',
                controller: 'HooksConfigController'
            })
    });
})();