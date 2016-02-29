(function() {
    'use strict';

    angular.module('components.config', [])

    .config(function($stateProvider) {

        $stateProvider

            // route for the about page
            .state('dashboard.config', {
                url: '/config',
                controller: 'ConfigController',
                templateUrl: '/app/components/config/index.html'
            });
    });
})();