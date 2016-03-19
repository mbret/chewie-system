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
        })

        .run(function($rootScope, $state, authenticationService){

            var redirectToAfterLogin = null;

            // Listen for error in transition
            // This error could be due to an authentication problem
            $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
                if (error && error.code === 'UNAUTHENTICATED') {

                    // Keep trace of failed route to redirect after login
                    redirectToAfterLogin = toState.name;
                    $state.go("signin");
                }
            });

            $rootScope.$on('$stateChangeStart', function (event, nextRoute, currentRoute) {

                // If we are authenticated and a route to redirect after login exist
                // then redirect to it.
                if (redirectToAfterLogin !== null && authenticationService.isAuth()) {
                    event.preventDefault();
                    var tmp = redirectToAfterLogin;
                    redirectToAfterLogin = null;
                    $state.go(tmp);
                }
            });
        })
})();