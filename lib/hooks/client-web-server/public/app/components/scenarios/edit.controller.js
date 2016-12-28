(function(){
    "use strict";

    angular
        .module("components.scenarios")
        .controller("EditScenariosController", function ($scope, $timeout, $uibModal, sharedApiService, $stateParams, util, _, notificationService, apiService, APP_CONFIG) {
            $scope.scenario = null;
            $scope.formId = "edit-scenarios";
            sharedApiService.get("/api/scenarios/" + $stateParams.scenario)
                .then(function(data) {
                    $scope.ready = true;
                    $scope.scenario = data;
                });

            $scope.confirm = function(form) {
                if (form.$valid) {
                    sharedApiService
                        .put("/api/scenarios/" + $scope.scenario.id, {
                            name: $scope.scenario.name,
                            description: $scope.scenario.description
                        })
                        .catch(function(error) {
                            notificationService.error("Error: " + error.data.message);
                        })
                }
            }
        });
})();