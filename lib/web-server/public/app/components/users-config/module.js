(function() {
    'use strict';

    angular.module('components.usersConfig', [])

    .config(function($stateProvider) {

        $stateProvider

            // route for the about page
            .state('dashboard.usersConfig', {
                url: '/users-config',
                controller: 'ConfigController',
                templateUrl: '/app/components/users-config/index.html'
            });
    });
})();