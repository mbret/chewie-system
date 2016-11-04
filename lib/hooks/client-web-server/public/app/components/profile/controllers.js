(function(){
    'use strict';

    angular
        .module('components.profile')

        .controller('ProfileController', function($rootScope, $scope, APP_CONFIG, userService, notificationService, sharedApiService, util, auth, $log){

            let onAuthUserUpdatedDeregister;
            $scope.formData = {};

            onAuthUserUpdatedDeregister = $rootScope.$on('auth:user:updated', function(){
                $log.log('new user', auth.getUser());
            });

            $scope.$on("$destroy", function() {
                onAuthUserUpdatedDeregister();
            });

            // Retrieve user detail
            sharedApiService.get(util.format('/users/%s', auth.getUser().getId()))
                .then(function(user){
                    mapDataWithForm(user);
                });

            // Submit plugin options form
            $scope.submitGeneral = function(form) {
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
                    sharedApiService
                        .put(util.format('/users/%s', auth.getUser().getId()), {
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