(function() {
    'use strict';

    angular.module('components.plugins', [])

        .config(function($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.when('/plugins', '/plugins/list');

            $stateProvider

                .state('chewie.dashboard.plugins', {
                    url: '/plugins',
                    template: '<ui-view/>',
                    controller  : 'ComponentsPluginsIndexController',
                    redirectTo: 'chewie.dashboard.plugins.list'
                })

                // route for the home page
                .state('chewie.dashboard.plugins.list', {
                    url: '/list',
                    templateUrl :'/app/components/plugins/index.html',
                    controller  : 'ComponentsPluginsListController',
                })

                .state('chewie.dashboard.plugins.detail', {
                    url: '/detail/:plugin',
                    templateUrl :'/app/components/plugins/detail.html',
                    controller  : 'DetailController',
                });
        })

        .run(function(sharedApiSocket, notificationService){
            
        });
})();