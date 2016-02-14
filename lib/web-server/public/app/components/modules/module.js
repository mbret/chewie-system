(function() {
    'use strict';

    angular.module('components.modules', [])

    .config(function($stateProvider) {

        $stateProvider

            // route for the about page
            .state('dashboard.modules', {
                url: '/modules',
                abstract: true,
                controller: 'ModulesController',
                templateUrl: '/app/components/modules/index.html'
            })

            .state('dashboard.modules.list', {
                url: '/list',
                controller: 'ModulesController',
                templateUrl: '/app/components/modules/list.html'
            })

            .state('dashboard.modules.config', {
                url: '/:id/configuration',
                templateUrl: '/app/components/modules/config.html',
                controller: 'ModulesConfigController'
            })
    });
})();