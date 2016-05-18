(function() {
    'use strict';

    var namespace = 'components.home';
    var parent = angular.module('myBuddy');
    var module = angular.module(namespace, []);

    module.root = parent.componentsRoot + '/home';
    module.namespace = namespace;

    module
        /**
         *
         */
        .config(function($stateProvider) {
            // set root
            // module.root = componentsRoot + '/home';

            $stateProvider
                // route for the home page
                .state('dashboard.home', {
                    url: '/home',
                    templateUrl : module.root + '/index.html',
                    controller  : module.namespace + '.HomeController'
                });
        })
        /**
         *
         */
        .run(function(mySocket, notificationService){
            
        });
})();