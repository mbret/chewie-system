'use strict';

let module = angular.module('app.buddy', [
    'ui.bootstrap',
    'ui.bootstrap.tabs',
    'ui.bootstrap.tpls',
    'ui.router',
    'angular-oauth2',
    'pascalprecht.translate',       // Angular Translate
    'daterangepicker',
    'btford.socket-io',
    "angular-logger",
    "ngStorage",
    'toastr',
    'wu.masonry',
    'app.shared',
    'components.core',
    'components.auth',
    'components.tasks',
    'components.modules',
    'components.screens',
    'components.taskTriggers',
    'components.repository',
    'components.home',
    'components.system',
    'components.profile',
    'components.playground',
    'components.scenarios',
    'components.plugins',
    'components.profileSelection',

    'app.buddy.google',

    'ngMessages',

    "components.debug"
]);

module.componentsRoot = '/app/components';
module.componentsNamespace = 'components';

module
    .factory('mySocket', function (socketFactory, APP_CONFIG) {
        let myIoSocket = io.connect(APP_CONFIG.sharedApiUrl);
        return socketFactory({
            ioSocket: myIoSocket
        });
    })

    .run(function(mySocket, APP_CONFIG, $rootScope, $state, notificationService, sharedApiService, authenticationService, util, googleApi, $log, $http){

        // Listen for events
        mySocket.on('events', function (data) {

            // notifications
            if (data.event === "notification") {
                let notification = data.data;
                // display only for all or (correct user if logged)
                if (notification.userId === null || (authenticationService.isAuth() && authenticationService.getUser().id === notification.userId)) {
                    notificationService.show(notification.type, notification.content);
                }
            }
        });

        // Listen for user update
        mySocket.on('user:updated', function(id){
            // broadcast info to scope
            $rootScope.$broadcast('user:updated', id);
        });

        $rootScope.$on('$stateChangeStart', function(evt, to, params) {
            if (to.redirectTo) {
                evt.preventDefault();
                $state.go(to.redirectTo, params);
            }

            // clean eventual dynamic class set
            //$rootScope.bodyClasses = ""; // @todo make bug when for example resolve redirect (then class is "")
        });

        $rootScope.$on('$stateChangeError', function(evt, to, toParams, from, fromParams, error) {
            // If an error is thrown with a route to redirect it could means some resolve has failed and
            // want to be redirected somewhere
            if (error.redirectTo) {
                $state.go(error.redirectTo);
            }
        });

        $rootScope.$on("$stateChangeSuccess", function(userInfo) {

        });

        // Listen for user login
        $rootScope.$on('auth:login:success', function(){
            // Register current user with google api so the api is ready to use user credentials
            googleApi.setUser(authenticationService.getUser());
        });

        console.info("APP_CONFIG", APP_CONFIG);

        $rootScope.APP_CONFIG = APP_CONFIG;
        $rootScope.systemInfo = APP_CONFIG.systemInfo;
        $rootScope.apiSocketConnected = true;

        // Listen for socket io events
        //
        mySocket.on('connect_error', function(err){
                $rootScope.apiSocketConnected = false;
            });
        mySocket.on('reconnect_error', function(err){
                $rootScope.apiSocketConnected = false;
            });
        mySocket.on('reconnect_failed', function(err){
                $rootScope.apiSocketConnected = false;
            });
        mySocket.on('connect', function(err){
                $rootScope.apiSocketConnected = true;
            });
        mySocket.on('reconnect', function(err){
                $rootScope.apiSocketConnected = true;
            });
    });