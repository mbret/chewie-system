(function() {
    'use strict';

    var parent = angular.module('app.buddy');

    var statics = {
        root: parent.componentsRoot + '/home',
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
                .state('dashboard.home', {
                    url: '/home',
                    templateUrl : module.statics.root + '/index.html',
                    controller  : module.statics.moduleName + '.HomeController'
                });
        })
        .run(function(mySocket, notificationService){
            
        });
})();