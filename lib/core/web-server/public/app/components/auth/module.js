(function() {
    'use strict';

    angular.module('components.auth', [])

        .value('user', {})

        .config(function($stateProvider) {

            $stateProvider

                // route for the about page
                .state('signin', {
                    url: '/auth/signin',
                    controller: 'SigninController',
                    templateUrl: '/app/components/auth/signin.html'
                })

                .state('signout', {
                    url: '/auth/signout',
                    controller: 'SignoutController',
                    templateUrl: '/app/components/auth/signout.html'
                })
        });
})();