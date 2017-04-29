(function() {
    'use strict';

    /**
     * @param sharedApiSocket
     * @param APP_CONFIG
     * @param $rootScope
     * @param $state
     * @param notificationService
     * @param sharedApiService
     * @param authenticationService
     * @param googleApi
     * @param $log
     * @param $http
     * @param authManager
     */
    function run(sharedApiSocket, APP_CONFIG, $rootScope, $state, notificationService, sharedApiService, authenticationService, googleApi, $log, $http, authManager){

        authManager.checkAuthOnRefresh();

        // Listen for events
        sharedApiSocket.on('events', function (data) {

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
        sharedApiSocket.on('user:updated', function(id){
            // broadcast info to scope
            $rootScope.$broadcast('user:updated', id);
        });

        $rootScope.$on('$stateChangeStart', function(evt, to, params) {
            if (to.redirectTo) {
                $log.info("$stateChangeStart:redirectTo", to.redirectTo);
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
                $log.warn("$stateChangeError:redirectTo", error.redirectTo);
                $state.go(error.redirectTo);
            }
        });

        $rootScope.$on("$stateChangeSuccess", function(userInfo) {

        });

        // Listen for user login
        // $rootScope.$on('auth:login:success', function(){
        //     // Register current user with google api so the api is ready to use user credentials
        //     googleApi.setUser(authenticationService.getUser());
        // });

        $log.info("APP_CONFIG", APP_CONFIG);

        $rootScope.APP_CONFIG = APP_CONFIG;
        $rootScope.systemInfo = APP_CONFIG.systemInfo;
        $rootScope.apiSocketConnected = true;

        // Listen for socket io events
        //
        sharedApiSocket.on('connect_error', function(err){
            $rootScope.apiSocketConnected = false;
        });
        sharedApiSocket.on('reconnect_error', function(err){
            $rootScope.apiSocketConnected = false;
        });
        sharedApiSocket.on('reconnect_failed', function(err){
            $rootScope.apiSocketConnected = false;
        });
        sharedApiSocket.on('connect', function(err){
            $rootScope.apiSocketConnected = true;
        });
        sharedApiSocket.on('reconnect', function(err){
            $rootScope.apiSocketConnected = true;
        });
    }

    angular
        .module('chewie', [
            "angular-jwt",
            'ui.bootstrap',
            'ui.bootstrap.tabs',
            'ui.bootstrap.tpls',
            'ui.router',
            'angular-oauth2',
            'pascalprecht.translate',
            'daterangepicker',
            'btford.socket-io',
            "angular-logger",
            "ngStorage",
            'toastr',
            'wu.masonry',
            'app.shared',
            "chewie.components",
            'chewie.google',
            'ngMessages',
            "components.debug"
        ])
        .run(run);
})();