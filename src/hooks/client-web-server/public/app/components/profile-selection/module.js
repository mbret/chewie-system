(function() {
    'use strict';

    let parent = angular.module('chewie');
    let module = angular.module(parent.componentsNamespace + '.profileSelection', []);

    module.rootDir = parent.componentsRoot + '/profile-selection';
    module
        .config(function($stateProvider) {
            // console.log(module.rootDir + '/index.html');
            // console.log(module.name + '.IndexController');
            $stateProvider

                .state("profileSelection", {
                    url: "/profile-selection",
                    templateUrl : module.rootDir + '/index.html',
                    controller  : module.name + '.IndexController',
                    //resolve: {
                    //    auth: function(authenticationService){
                    //        return authenticationService.resolveAuth();
                    //    }
                    //}
                })
        })
        .run(function(sharedApiSocket, notificationService){

        });
})();