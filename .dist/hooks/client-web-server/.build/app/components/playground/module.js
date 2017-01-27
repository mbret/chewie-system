(function() {
    'use strict';

    angular.module('components.playground', [])

        .config(function($stateProvider) {

            $stateProvider

                // route for the home page
                .state('dashboard.playground', {
                    url: '/playground',
                    templateUrl :'/app/components/playground/index.html',
                    controller  : 'ComponentsPlaygroundIndexController',
                });
        })
        .run(function(sharedApiSocket, notificationService){
            
        })
})();