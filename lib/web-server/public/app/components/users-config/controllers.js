(function(){
    'use strict';

    angular
        .module('components.usersConfig')

        .controller('UsersConfigController', function($scope, APP_CONFIG, userService, notificationService, user){

            $scope.googleConfig = {
                clientId: user.config.externalServices.google.auth.clientId,
                clientSecret: user.config.externalServices.google.auth.clientSecret,
            };

            $scope.submitGoogle = function(form){
                if(form.$valid){
                    userService.updateUsersConfig({
                        'externalServices.google.auth.clientId': $scope.googleConfig.clientId,
                        'externalServices.google.auth.clientSecret': $scope.googleConfig.clientSecret,
                    }).then(function(){
                        notificationService.success('Updated');
                    });
                }
            };

        });
})();