(function(){
    'use strict';

    angular.module('myBuddy')

        .constant('annyang', annyang)

        .constant('_', _)

        .constant('APP_CONFIG', {
            viewBaseUrl: 'app/views',
            apiUri: SERVER_CONFIG.apiUrl,
            systemConfig: SERVER_CONFIG.systemConfig,
        })

        .constant('TASK_TYPE', {
            schedule: 'ScheduledTask',
            trigger: 'TriggeredTask'
        })

        .config(function($stateProvider, $urlRouterProvider, APP_CONFIG) {

            $urlRouterProvider
                .when('', '/dashboard/home');

            $stateProvider

                .state('speech', {
                    url: '/speech',
                    controller: 'SpeechController',
                    templateUrl: APP_CONFIG.viewBaseUrl + '/speech.html'
                })

                .state('dashboard', {
                    abstract: true,
                    url: "/dashboard",
                    templateUrl: APP_CONFIG.viewBaseUrl + '/templates/content.html',
                    resolve: {
                        auth: function(authenticationService){
                            return authenticationService.resolveAuth();
                        }
                    }
                })

                // route for the home page
                .state('dashboard.home', {
                    url: '/home',
                    templateUrl : APP_CONFIG.viewBaseUrl + '/index.html',
                    controller  : 'IndexController',
                })

                .state('dashboard.coreModules', {
                    url: '/core-modules',
                    templateUrl: APP_CONFIG.viewBaseUrl + '/core-modules.html',
                    controller: 'CoreModulesController',
                    abstract: true
                })

                .state('dashboard.coreModules.list', {
                    url: '/list',
                    templateUrl: APP_CONFIG.viewBaseUrl + '/core-modules-list.html',
                    controller: 'CoreModulesController'
                })

                .state('dashboard.coreModules.detail', {
                    url: '/:id',
                    templateUrl: APP_CONFIG.viewBaseUrl + '/core-modules.html',
                    abstract: true
                })

                .state('dashboard.coreModules.detail.config', {
                    url: '/configuration',
                    templateUrl: APP_CONFIG.viewBaseUrl + '/core-modules-detail-config.html',
                    controller: 'CoreModulesDetailConfigController'
                })

                .state('dashboard.messagesAdapters', {
                    url: '/messages-adapters',
                    abstract: true,
                    templateUrl: APP_CONFIG.viewBaseUrl + '/messages-adapters.html',
                    controller: 'MessagesAdaptersController'
                })

                .state('dashboard.messagesAdapters.list', {
                    url: '/list',
                    templateUrl: APP_CONFIG.viewBaseUrl + '/messages-adapters-list.html',
                    controller: 'MessagesAdaptersListController'
                })

                .state('dashboard.messagesAdapters.detail', {
                    url: '/:id',
                    templateUrl: APP_CONFIG.viewBaseUrl + '/messages-adapters-detail.html',
                    controller: 'MessagesAdaptersDetailController'
                })

                .state('dashboard.plugins', {
                    url: '/plugins',
                    templateUrl: APP_CONFIG.viewBaseUrl + '/plugins.html',
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