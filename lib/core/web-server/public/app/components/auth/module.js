(function() {
    'use strict';

    angular.module('components.auth', [])

    .config(function($stateProvider) {

        $stateProvider

            // route for the about page
            .state('signin', {
                url: '/auth/signin',
                controller: 'SigninController',
                templateUrl: '/app/components/config/index.html'
            });
    });
})();