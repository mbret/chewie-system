(function(){
    "use strict";

    angular
        .module('components.hooks')

        .controller('HooksConfigController', function($scope, $http, $uibModal, apiService, APP_CONFIG, $log, sharedApiService, $stateParams, notificationService, _){

            let id = $stateParams.id;
            $scope.hook = null;
            $scope.name = id;
            $scope.formData = {
                options: {}
            };
            apiService.get("/api/hooks/" + id)
                .then(function(response) {
                    $scope.hook = response.data;

                    // retrieve config of hook
                    return sharedApiService.get("/devices/" + APP_CONFIG.systemId + "/hooks-config/" + id)
                        .then(function(data) {
                            $scope.formData.options = data.data;
                        })
                        .catch(function(err) {
                            if (err.status === 404) {
                                // empty config
                            } else {
                                throw err;
                            }
                        });
                })
                .catch(function(err) {
                    console.error(err);
                });

            $scope.submit = function(form) {
                if (form.$valid) {
                    let data = {
                        options: $scope.formData.options
                    };

                    sharedApiService.put("/devices/" + APP_CONFIG.systemId + "/hooks-config/" + id, data)
                        .then(function(){
                            notificationService.success('Saved');
                        })
                        .catch(console.error);
                }
            };
        });
})();