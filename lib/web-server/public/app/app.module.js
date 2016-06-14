'use strict';

var module = angular.module('app.buddy', [
    'ui.bootstrap',
    'ui.bootstrap.tabs',
    'ui.bootstrap.tpls',
    'ui.router',
    'angular-oauth2',
    'pascalprecht.translate',       // Angular Translate
    'daterangepicker',
    'btford.socket-io',
    "angular-logger",
    'toastr',
    'app.shared',
    'components.core',
    'components.auth',
    'components.tasks',
    'components.preferences',
    'components.modules',
    'components.screens',
    'components.taskTriggers',
    'components.repository',
    'components.home',
    'components.system',
    'components.profile',
    'components.playground',
    'components.plugins',
    'components.profileSelection',

    'app.buddy.google',

    'ngMessages'
]);

module.componentsRoot = '/app/components';
module.componentsNamespace = 'components';

module

    .factory('mySocket', function (socketFactory, APP_CONFIG) {
        var myIoSocket = io.connect(APP_CONFIG.apiUri);

        var mySocket = socketFactory({
            ioSocket: myIoSocket
        });

        return mySocket;
    })

    .run(function(mySocket, APP_CONFIG, $rootScope, $state, notificationService, apiService, authenticationService, util, googleApi, $log){

        // Listen for notification from the server
        mySocket.on('notification:new', function (data) {
            switch(data.type){
                case 'error':
                    notificationService.error(data.message);
                    break;
                case 'warning':
                    notificationService.warning(data.message);
                    break;
                case 'success':
                    notificationService.success(data.message);
                    break;
                default:
                    notificationService.info(data.message);
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

        console.log(APP_CONFIG);

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