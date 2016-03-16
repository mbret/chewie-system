'use strict';

angular.module('myBuddy', [
    'ui.bootstrap',
    'ui.bootstrap.tabs',
    'ui.bootstrap.tpls',
    'ui.router',
    'pascalprecht.translate',       // Angular Translate
    'daterangepicker',
    'btford.socket-io',
    'toastr',
    'components.core',
    'components.auth',
    'components.tasks',
    'components.config',
    'components.usersConfig',
    'components.modules',
    'components.screens',
    'components.taskTriggers',
    'ngMessages'
]);

angular.module('myBuddy')

    .factory('mySocket', function (socketFactory, APP_CONFIG) {
        var myIoSocket = io.connect(APP_CONFIG.apiUri);

        var mySocket = socketFactory({
            ioSocket: myIoSocket
        });

        return mySocket;
    })

    .run(function(mySocket, APP_CONFIG, $rootScope, $state, notificationService){

        // Listen for notification from the server
        mySocket.on('notification:new', function (data) {
            switch(data.type){
                case 'error':
                    notificationService.error(data.message);
                    break;
                case 'warn':
                    notificationService.warning(data.message);
                    break;
                default:
                    notificationService.info(data.message);
            }
        });

        // This event is important after user logout
        // It ensure that the user may log again safely
        // When user logout several tasks may occurs on server like clean tasks / files / etc
        // We should only log user again when everything is ok to not corrupt system.
        mySocket.on('user:logged:out:task:complete', function(data) {
            notificationService.success('The user can now log in again');
        });

        $rootScope.APP_CONFIG = APP_CONFIG;

        $rootScope.$on("$stateChangeSuccess", function(userInfo) {
            console.log(userInfo);
        });

        $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
            if (error && error.code === 'UNAUTHENTICATED') {
                $state.go("signin");
            }
        });
    });