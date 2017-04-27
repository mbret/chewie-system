(function(){
    "use strict";

    angular
        .module("components.scenarios")
        .controller("EditScenariosController", function ($scope, $timeout, $uibModal, sharedApiService, $stateParams, _, notificationService, apiService, APP_CONFIG) {
            $scope.scenario = null;
            $scope.formId = "edit-scenarios";

            // fetch scenario details
            sharedApiService.get("/api/devices/" + APP_CONFIG.systemId + "/scenarios/" + $stateParams.scenario)
                .then(function(data) {
                    $scope.ready = true;
                    $scope.scenario = data;
                });

            $scope.confirm = function(form) {
                if (!form.$valid) {
                    notificationService.warning("Your form is invalid");
                } else {
                    sharedApiService
                        .put("/api/devices/" + APP_CONFIG.systemId + "/scenarios/" + $scope.scenario.id, {
                            name: $scope.scenario.name,
                            description: $scope.scenario.description,
                            nodes: $scope.scenario.nodes,
                            autoStart: $scope.scenario.autoStart
                        })
                        .catch(function(error) {
                            notificationService.error("Error: " + error.data.message);
                        });
                }
            };
        });
})();