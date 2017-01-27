(function() {
    'use strict';

    angular.module('components.plugins', [])

        .config(function($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.when('/plugins', '/plugins/list');

            $stateProvider

                .state('dashboard.plugins', {
                    url: '/plugins',
                    template: '<ui-view/>',
                    controller  : 'ComponentsPluginsIndexController',
                    redirectTo: 'dashboard.plugins.list'
                })

                // route for the home page
                .state('dashboard.plugins.list', {
                    url: '/list',
                    templateUrl :'/app/components/plugins/index.html',
                    controller  : 'ComponentsPluginsListController',
                })

                .state('dashboard.plugins.detail', {
                    url: '/detail/:plugin',
                    templateUrl :'/app/components/plugins/detail.html',
                    controller  : 'DetailController',
                });
        })

        .run(function(sharedApiSocket, notificationService){
            
        });
})();