(function(){
    'use strict';

    angular
        .module('components.preferences')

        .controller('PreferencesController', function($scope, APP_CONFIG, userService, notificationService, apiService, util, auth){

            //$scope.googleConfig = {
            //    clientId: user.config.externalServices.google.auth.clientId,
            //    clientSecret: user.config.externalServices.google.auth.clientSecret,
            //};

            $scope.formData = {};

            // Retrieve user detail
            apiService.get(util.format('/users/%s', auth.getUser().getId()))
                .then(function(user){
                    $scope.formData.foo = user.config.foo
                });

            //$scope.submitGoogle = function(form){
            //    if(form.$valid){
            //        userService.updateUsersConfig({
            //            'externalServices.google.auth.clientId': $scope.googleConfig.clientId,
            //            'externalServices.google.auth.clientSecret': $scope.googleConfig.clientSecret,
            //        }).then(function(){
            //            notificationService.success('Updated');
            //        });
            //    }
            //};

            // Submit plugin options form
            $scope.submitGeneral = function(form){
                form.submitted = true;
                if (!form.$valid) {
                    notificationService.warning('Your form has some errors');
                }
                else{
                    var config = {
                        foo: $scope.formData.foo
                    };

                    // We only put userOptions
                    apiService.put(util.format('/users/%s', auth.getUser().getId()), {
                            config: config
                        })
                        .then(function(updatedData){
                            $scope.formData.foo = updatedData.config.foo
                        });
                }
            };

        });
})();