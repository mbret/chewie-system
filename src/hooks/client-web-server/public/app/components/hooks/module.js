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
                templateUrl: '/app/components/modules/index.html'
            })

            .state('dashboard.hooks.list', {
                url: '/list',
                controller: 'ModulesController',
                templateUrl: '/app/components/modules/list.html'
            })

            .state('dashboard.hooks.config', {
                url: '/:id/configuration',
                templateUrl: '/app/components/modules/config.html',
                controller: 'ModulesConfigController'
            })
    });
})();