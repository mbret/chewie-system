(function(){
    'use strict';

    angular
        .module('components.plugins')

        .controller('IndexController', function($scope){

        })

        .controller('ListController', function($scope, $http, toastr, APP_CONFIG, apiService, auth, mySocket, notificationService, util){

            $scope.plugins = [];

            apiService.get(util.format('/users/%s/plugins', auth.getUser().getId()))
                .then(function(data){
                    $scope.plugins = data;
                });
        })

        .controller('DetailController', function($scope, $http, toastr, APP_CONFIG, apiService, auth, mySocket, notificationService, util, $stateParams, _){

            $scope.plugin = {};
            $scope.formData = {};

            // Retrieve plugin details
            apiService.get(util.format('/users/%s/plugins/%s', auth.getUser().getId(), $stateParams.plugin))
                .then(function(data){
                    $scope.plugin = data;
                    $scope.formData.options = data.userOptions;
                });

            // Submit plugin options form
            $scope.submit = function(form){
                form.submitted = true;
                if (!form.$valid) {
                    notificationService.warning('Your form has some errors');
                }
                else{
                    // We only put userOptions
                    apiService.put(util.format('/users/%s/plugins/%s', auth.getUser().getId(), $stateParams.plugin), {
                        userOptions: $scope.formData.options
                    })
                        .then(function(updatedData){
                            $scope.plugin = updatedData;
                            $scope.formData.options = updatedData.userOptions;
                        })
                        .catch(function(err){

                        });
                }
            };

        });
})();