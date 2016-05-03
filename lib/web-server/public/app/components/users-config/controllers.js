(function(){
    'use strict';

    angular
        .module('components.preferences')

        .controller('PreferencesController', function($scope, APP_CONFIG, userService, notificationService, apiService, util, auth){

            $scope.formData = {};

            // Retrieve user detail
            apiService.get(util.format('/users/%s', auth.getUser().getId()))
                .then(function(user){
                    mapDataWithForm(user);
                });

            // Submit plugin options form
            $scope.submitGeneral = function(form){
                form.submitted = true;
                if (!form.$valid) {
                    notificationService.warning('Your form has some errors');
                }
                else{
                    var config = {
                        foo: $scope.formData.foo,
                        externalServices: {
                            google: {
                                auth: {
                                    clientId: $scope.formData.googleClientId,
                                    clientSecret: $scope.formData.googleClientSecret,
                                }
                            }
                        }
                    };

                    // We only put userOptions
                    apiService.put(util.format('/users/%s', auth.getUser().getId()), {
                            config: config
                        })
                        .then(function(updatedData){
                            mapDataWithForm(updatedData);
                        });
                }
            };

            function mapDataWithForm(apiData){
                $scope.formData.foo = apiData.config.foo;
                $scope.formData.googleClientId = apiData.config.externalServices.google.auth.clientId;
                $scope.formData.googleClientSecret = apiData.config.externalServices.google.auth.clientSecret;
            }
        });
})();