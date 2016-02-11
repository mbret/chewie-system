(function(){
    'use strict';

    angular
        .module('components.config')

        .controller('ConfigController', function($scope, APP_CONFIG, apiService){

            $scope.googleConfig = {
                clientId: APP_CONFIG.systemConfig.externalServices.google.auth.clientId,
                clientSecret: APP_CONFIG.systemConfig.externalServices.google.auth.clientSecret,
            };

            $scope.submitGoogle = function(form){
                if(form.$valid){
                    apiService.updateConfig({
                        externalServices: {
                            google: {
                                auth: {
                                    clientId: $scope.googleConfig.clientId,
                                    clientSecret: $scope.googleConfig.clientSecret,
                                }
                            }
                        }
                    })
                }
            };

        });
})();