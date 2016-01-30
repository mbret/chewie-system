(function(){
    'use strict';

    angular.module('myBuddy')

        .constant('CONFIG', {
            viewBaseUrl: 'app/views',
            apiUri: 'http://localhost:3001'
        })

        .constant('TASK_TYPE', {
            schedule: 'ScheduledTask'
        })

        .config(function($stateProvider, $urlRouterProvider, CONFIG) {

            $urlRouterProvider
                .when('', '/dashboard/home');

            $stateProvider

                .state('dashboard', {
                    abstract: true,
                    url: "/dashboard",
                    templateUrl: CONFIG.viewBaseUrl + '/common/content.html',
                })

                // route for the home page
                .state('dashboard.home', {
                    url: '/home',
                    templateUrl : CONFIG.viewBaseUrl + '/index.html',
                    controller  : 'IndexController'
                })

                // route for the about page
                .state('dashboard.tasks', {
                    url: '/tasks',
                    templateUrl : CONFIG.viewBaseUrl + '/tasks.html',
                    controller  : 'TasksController'
                })

                .state('dashboard.modules', {
                    url: '/modules',
                    templateUrl: CONFIG.viewBaseUrl + '/modules.html',
                    controller: 'ModulesController'
                })

                .state('dashboard.coreModules', {
                    url: '/core-modules',
                    templateUrl: CONFIG.viewBaseUrl + '/core-modules.html',
                    controller: 'CoreModulesController',
                    abstract: true
                })

                .state('dashboard.coreModules.list', {
                    url: '/list',
                    templateUrl: CONFIG.viewBaseUrl + '/core-modules-list.html',
                    controller: 'CoreModulesController'
                })

                .state('dashboard.coreModules.detail', {
                    url: '/:id',
                    templateUrl: CONFIG.viewBaseUrl + '/core-modules.html',
                    abstract: true
                })

                .state('dashboard.coreModules.detail.config', {
                    url: '/configuration',
                    templateUrl: CONFIG.viewBaseUrl + '/core-modules-detail-config.html',
                    controller: 'CoreModulesDetailConfigController'
                })

                .state('dashboard.messagesAdapters', {
                    url: '/messages-adapters',
                    abstract: true,
                    templateUrl: CONFIG.viewBaseUrl + '/messages-adapters.html',
                    controller: 'MessagesAdaptersController'
                })

                .state('dashboard.messagesAdapters.list', {
                    url: '/list',
                    templateUrl: CONFIG.viewBaseUrl + '/messages-adapters-list.html',
                    controller: 'MessagesAdaptersController'
                })

                .state('dashboard.messagesAdapters.detail', {
                    url: '/:id',
                    templateUrl: CONFIG.viewBaseUrl + '/messages-adapters-detail.html',
                    controller: 'MessagesAdaptersDetailController'
                })

                .state('dashboard.plugins', {
                    url: '/plugins',
                    templateUrl: CONFIG.viewBaseUrl + '/plugins.html',
                    controller: 'PluginsController'
                })
        })

        .config(function(toastrConfig) {
            angular.extend(toastrConfig, {
                autoDismiss: true,
                timeOut: 10000,
            });
        })

        .config(function config($translateProvider) {
            $translateProvider.preferredLanguage('fr');
        });
})();