angular.module('myBuddy', [
    'ui.bootstrap',
    'ui.bootstrap.tabs',
    'ui.bootstrap.tpls',
    'ui.router',
    'pascalprecht.translate',       // Angular Translate
    'daterangepicker',
    'btford.socket-io',
    'toastr',
    'components.tasks',
    'components.config',
    'components.usersConfig',
    'components.modules',
    'components.screens',
]);

angular.module('myBuddy')

    .factory('mySocket', function (socketFactory, APP_CONFIG) {
        var myIoSocket = io.connect(APP_CONFIG.apiUri);

        var mySocket = socketFactory({
            ioSocket: myIoSocket
        });

        return mySocket;
    })

    .run(function(mySocket, toastr, APP_CONFIG, $rootScope){

        mySocket.on('notification:new', function (data) {
            switch(data.type){
                case 'error':
                    toastr.error(data.message);
                    break;
                case 'warn':
                    toastr.warning(data.message);
                    break;
                default:
                    toastr.info(data.message);
            }
        });

        $rootScope.APP_CONFIG = APP_CONFIG;
    });