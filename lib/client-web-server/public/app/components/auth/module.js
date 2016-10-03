(function() {
    'use strict';

    angular.module('components.auth', [])

        .config(function($stateProvider) {

            $stateProvider

                // route for the about page
                .state('signin', {
                    url: '/auth/signin',
                    controller: 'SigninController',
                    templateUrl: '/app/components/auth/signin.html',
                    resolve: {
                        // selected profile (an username)
                        selectedProfile: function($rootScope) {
                            return new Promise(function(resolve, reject) {
                                // profile found on runtime
                                if ($rootScope.selectedProfile) {
                                    return resolve($rootScope.selectedProfile)
                                }
                                // No profile found, redirect to profile page
                                var err = new Error("No profile selected");
                                err.redirectTo = "profileSelection";
                                return reject(err);
                            });
                        },
                        clearCredentials: function(authenticationService) {
                            // Clear actual credentials
                            authenticationService.clearCredentials();
                        }
                    }
                })

                .state('signout', {
                    url: '/auth/signout',
                    controller: 'SignoutController',
                    templateUrl: '/app/components/auth/signout.html'
                })
        })

        .run(function($rootScope, $state, authenticationService, $location, util, apiService){

            var redirectToAfterLogin = null;

            // Listen for error in transition
            // This error could be due to an authentication problem
            $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
                if (error && error.code === 'UNAUTHENTICATED') {

                    // Keep trace of failed route to redirect after login
                    redirectToAfterLogin = $location.path();
                    $state.go("signin");
                }
            });

            $rootScope.$on('$stateChangeStart', function (event, nextRoute, currentRoute) {

                // If we are authenticated and a route to redirect after login exist
                // then redirect to it.
                if (redirectToAfterLogin !== null && authenticationService.isAuth()) {
                    $location.path(redirectToAfterLogin).replace();
                    redirectToAfterLogin = null;
                }
            });

            // Listen for user update
            // update the current user containing inside auth service
            $rootScope.$on('user:updated', function(e, id){
                if(authenticationService.isAuth()){
                    // Check if user updated is current user
                    if(authenticationService.getUser().id === id){
                        // If yes update current user
                        authenticationService.updateUser(id);
                    }
                }
            });
        })
})();