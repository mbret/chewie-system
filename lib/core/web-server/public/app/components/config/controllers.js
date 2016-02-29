(function(){
    'use strict';

    angular
        .module('components.config')

        .controller('ConfigController', function($scope, APP_CONFIG, apiService, notificationService){

            $scope.config = {
                foo: APP_CONFIG.systemConfig.foo,
            };

            $scope.submitConfigForm = function(form){
                if(form.$valid){
                    apiService.updateConfig({
                        'foo': $scope.config.foo
                    }).then(function(){
                        notificationService.success('Updated');
                    });
                }
            };

        });
})();