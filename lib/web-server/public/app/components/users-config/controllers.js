(function(){
    'use strict';

    angular
        .module('components.usersConfig')

        .controller('ConfigController', function($scope, APP_CONFIG, apiService, notificationService, user){

            $scope.googleConfig = {
                clientId: user.config.externalServices.google.auth.clientId,
                clientSecret: user.config.externalServices.google.auth.clientSecret,
            };

            $scope.submitGoogle = function(form){
                if(form.$valid){
                    apiService.updateUsersConfig({
                        'externalServices.google.auth.clientId': $scope.googleConfig.clientId,
                        'externalServices.google.auth.clientSecret': $scope.googleConfig.clientSecret,
                    }).then(function(){
                        notificationService.success('Updated');
                    });
                }
            };

        });
})();