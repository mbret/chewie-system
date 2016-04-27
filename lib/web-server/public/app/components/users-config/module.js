(function() {
    'use strict';

    angular.module('components.preferences', [])

    .config(function($stateProvider) {

        $stateProvider

            // route for the about page
            .state('dashboard.preferences', {
                url: '/users-config',
                controller: 'PreferencesController',
                templateUrl: '/app/components/users-config/index.html'
            });
    });
})();