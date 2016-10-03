(function() {
    'use strict';

    angular.module('components.repository', [])

    .config(function($stateProvider) {

        $stateProvider

            // route for the about page
            .state('dashboard.repository', {
                url: '/repository',
                controller: 'RepositoryController',
                templateUrl: '/app/components/repository/index.html'
            });
    });
})();