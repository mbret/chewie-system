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
    'components.preferences',
    'components.modules',
    'components.screens',
    'components.taskTriggers',
    'components.repository',
    'components.home',
    'components.system',
    'components.profile',
    'components.plugins',
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

    .run(function(mySocket, APP_CONFIG, $rootScope, $state, notificationService, apiService){

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

        $rootScope.$on('$stateChangeStart', function(evt, to, params) {
            if (to.redirectTo) {
                evt.preventDefault();
                $state.go(to.redirectTo, params);
            }
        });

        console.log(APP_CONFIG);

        $rootScope.APP_CONFIG = APP_CONFIG;
        $rootScope.systemInfo = APP_CONFIG.systemInfo;

        $rootScope.$on("$stateChangeSuccess", function(userInfo) {

        });
    });