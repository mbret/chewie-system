(function() {
    'use strict';

    angular
        .module('components.profile', [])
        .config(function($stateProvider) {
            $stateProvider
                // route for the home page
                .state('chewie.dashboard.profile', {
                    url: '/profile',
                    templateUrl :'/app/components/profile/index.html',
                    controller  : 'ProfileController',
                });
        });
})();