(function() {
    'use strict';

    var parent = angular.module('chewie');

    var statics = {
        root: '/app/components/home',
        namespace: 'components',
        moduleName: 'components.home'
    };

    var module = angular.module(statics.moduleName, []);

    module.statics = statics;

    module
        .config(function($stateProvider) {
            // set root
            // module.root = componentsRoot + '/home';

            $stateProvider
                // route for the home page
                .state('chewie.dashboard.home', {
                    url: '/home',
                    templateUrl : module.statics.root + '/index.html',
                    controller  : module.statics.moduleName + '.HomeController'
                });
        })
        .run(function(sharedApiSocket, notificationService){
            
        });
})();