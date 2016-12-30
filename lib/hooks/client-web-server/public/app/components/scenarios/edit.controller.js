(function(){
    "use strict";

    angular
        .module("components.scenarios")
        .controller("EditScenariosController", function ($scope, $timeout, $uibModal, sharedApiService, $stateParams, util, _, notificationService, apiService, APP_CONFIG) {
            $scope.scenario = null;
            $scope.formId = "edit-scenarios";

            // fetch scenario details
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
                            description: $scope.scenario.description,
                            nodes: $scope.scenario.nodes
                        })
                        .catch(function(error) {
                            notificationService.error("Error: " + error.data.message);
                        })
                }
            };
        });
})();