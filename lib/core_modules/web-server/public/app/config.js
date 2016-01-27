(function(){
    'use strict';

    angular.module('myBuddy')

        .constant('CONFIG', {
            viewBaseUrl: 'app/views',
            apiUri: 'http://localhost:3001'
        })

        .config(function($stateProvider, $urlRouterProvider, CONFIG) {

            $urlRouterProvider
                .when('', '/dashboards/home');

            $stateProvider

                .state('dashboards', {
                    abstract: true,
                    url: "/dashboards",
                    templateUrl: CONFIG.viewBaseUrl + '/common/content.html',
                })

                // route for the home page
                .state('dashboards.home', {
                    url: '/home',
                    templateUrl : CONFIG.viewBaseUrl + '/index.html',
                    controller  : 'IndexController'
                })

                // route for the about page
                .state('dashboards.tasks', {
                    url: '/tasks',
                    templateUrl : CONFIG.viewBaseUrl + '/tasks.html',
                    controller  : 'TasksController'
                })

                .state('dashboards.modules', {
                    url: '/modules',
                    templateUrl: CONFIG.viewBaseUrl + '/modules.html',
                    controller: 'ModulesController'
                })

                .state('dashboards.messagesAdapters', {
                    url: '/messages-adapters',
                    abstract: true,
                    templateUrl: CONFIG.viewBaseUrl + '/messages-adapters.html',
                    controller: 'MessagesAdaptersController'
                })

                .state('dashboards.messagesAdapters.list', {
                    url: '/list',
                    templateUrl: CONFIG.viewBaseUrl + '/messages-adapters-list.html',
                    controller: 'MessagesAdaptersController'
                })

                .state('dashboards.messagesAdapters.detail', {
                    url: '/:id',
                    templateUrl: CONFIG.viewBaseUrl + '/messages-adapters-detail.html',
                    controller: 'MessagesAdaptersDetailController'
                })

                .state('dashboards.plugins', {
                    url: '/plugins',
                    templateUrl: CONFIG.viewBaseUrl + '/plugins.html',
                    controller: 'PluginsController'
                })
        })

        .config(function(toastrConfig) {
            angular.extend(toastrConfig, {
                autoDismiss: true,
                timeOut: 5000,
            });
        })

        .config(function config($translateProvider) {

            $translateProvider.preferredLanguage('fr');

        });
})();