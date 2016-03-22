(function(){
    'use strict';

    angular
        .module('components.auth')

        .controller('SigninController', function($rootScope, $scope, APP_CONFIG, apiService, notificationService, authenticationService, $timeout, $state, user){
            $timeout(function(){
                authenticationService.login('admin', 'admin')
                    .then(function(){
                        notificationService.success('Logged in!');
                        $state.go('dashboard.home');
                    })
                    .catch(function(err){
                        if(err.status === 400){
                            notificationService.warning('Bad credentials');
                        }
                    });
            }, 1);
        })

        .controller('SignoutController', function($scope, APP_CONFIG, apiService, notificationService, authenticationService, $timeout, $state, user){
            authenticationService.logout().then(function(){
                notificationService.success('Logged out!');
                //$state.go('dashboard.home');
            })
        });
})();