(function(){
    'use strict';

    angular
        .module('components.plugins')

        .controller('ComponentsPluginsIndexController', function($scope){

        })

        .controller('ComponentsPluginsListController', function($scope, $http, toastr, APP_CONFIG, sharedApiService, auth, sharedApiSocket, notificationService){

            $scope.plugins = [];

            // Get saved plugins for this user
            sharedApiService.get(`/users/${auth.getUser().getId()}/plugins`)
                .then(function(data){
                    $scope.plugins = data;

                    // For each plugins check the kind of module are added
                    $scope.plugins.forEach(function(plugin){
                        let modulesUsed = new Set();
                        plugin.pluginPackage.modules.forEach(function(moduleInfo){
                            modulesUsed.add(moduleInfo.type);
                        });
                        plugin.modulesUsed = Array.from(modulesUsed);
                    });

                });
        })

        .controller('DetailController', function($scope, $http, toastr, APP_CONFIG, sharedApiService, auth, sharedApiSocket, notificationService, $stateParams, _){

            $scope.plugin = {};
            $scope.formData = {};

            // Retrieve plugin details
            sharedApiService.get(`/plugins/${auth.getUser().getId()}`, $stateParams.plugin)
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
                    sharedApiService
                        .put(`/users/%s/plugins/${auth.getUser().getId()}`, $stateParams.plugin), {
                            userOptions: $scope.formData.options
                        }
                        .then(function(updatedData){
                            $scope.plugin = updatedData;
                            $scope.formData.options = updatedData.userOptions;
                        })
                        .catch(function(err){});
                }
            };

        });
})();