(function() {
    'use strict';

    angular
        .module("chewie.components.profileSelection", [])
        .config(function($stateProvider) {
            $stateProvider
                .state("profileSelection", {
                    url: "/profile-selection",
                    templateUrl : '/app/components/profile-selection/index.html',
                    controller  : 'ComponentsProfileSelectionIndexController',
                })
        })
        .run(function(sharedApiSocket, notificationService){

        });
})();