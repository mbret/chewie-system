(function(){
    'use strict';

var module = angular.module('app.buddy');

module
        .constant('annyang', annyang)
        .constant('_', _)
        .constant('componentsRoot', '/app/components')
        .constant('APP_CONFIG', _.merge(SERVER_CONFIG, {
            copyrightDates: '2015-2016',
            systemName: 'My Buddy',
            viewBaseUrl: 'app/views'
        }))
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
                    controller: 'DashboardController',
                    resolve: {
                        auth: function(authenticationService){
                            return authenticationService.resolveAuth();
                        }
                    },
                    onEnter: function($rootScope) {
                        $rootScope.bodyClasses = "";
                    }
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
        })

        .config(['OAuthProvider', function(OAuthProvider) {
            OAuthProvider.configure({
                baseUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
                clientId: 'CLIENT_ID',
                clientSecret: 'CLIENT_SECRET' // optional
            });
        }])

        .config(function(authenticationServiceProvider, _){

            function User(data){
                this.id = data.id;
                this.update(data);

                this.getProfileImage = function(size){
                    return "resources/img/" + 'profile_default_' + size + '.gif';
                };

                this.getId = function(){
                    return this.id;
                };
            }

            /**
             * Update current object with new data
             */
            User.prototype.update = function(data) {
                this.config = data.config;
                this.createdAt = data.createdAt;
                this.firstName = data.firstName;
                this.lastName = data.lastName;
                this.role = data.role;
                this.updatedAt = data.updatedAt;
                this.username = data.username;
            };

            authenticationServiceProvider.setUserModel(User);
        })

        .config(function(toastrConfig) {
            angular.extend(toastrConfig, {
                autoDismiss: true,
                timeOut: 10000,
            });
        })

        /**
         * https://github.com/better-js-logging/angular-logger
         */
        .config(function (logEnhancerProvider) {
            logEnhancerProvider.datetimePattern = 'dddd h:mm:ss a';
            logEnhancerProvider.logLevels = {
                '*': logEnhancerProvider.LEVEL.DEBUG
            };
        })

        .config(function (sharedApiServiceProvider, APP_CONFIG) {
            sharedApiServiceProvider.setApiUri(APP_CONFIG.apiUrl + "/remote-api");
        })

        .config(function config($translateProvider) {
            $translateProvider.preferredLanguage('fr');
        });
})();