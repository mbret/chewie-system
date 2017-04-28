(function() {
    'use strict';

    angular.module('components.system', [])

        .config(function($stateProvider) {

            $stateProvider

                // route for the home page
                .state('chewie.dashboard.system', {
                    url: '/system',
                    templateUrl :'/app/components/system/index.html',
                    controller  : 'SystemController',
                });
        })
        .run(function(sharedApiSocket, notificationService){
            
        })
})();