(function() {
    'use strict';

    angular.module('components.home', [])

        .config(function($stateProvider) {

            $stateProvider

                // route for the home page
                .state('dashboard.home', {
                    url: '/home',
                    templateUrl :'/app/components/home/index.html',
                    controller  : 'HomeController',
                });
        })
        .run(function(mySocket, notificationService){
            
        })
})();