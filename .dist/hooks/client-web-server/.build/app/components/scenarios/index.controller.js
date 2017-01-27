(function(){
    'use strict';

    angular
        .module('components.scenarios')
        .controller('IndexScenariosController', function($scope, $state, sharedApiService, auth, util, _, apiService, sharedApiSocket, $log, APP_CONFIG, alerts, $timeout, apiSocket){

            $scope.scenarios = [];
            $scope.runningScenarios = [];

            $scope.remove = function(scenario) {
                alerts.confirm().then(function(confirm) {
                    if(confirm) {
                        sharedApiService.delete("/scenarios/" + scenario.id);
                    }
                });
            };

            $scope.run = function(scenario) {
                apiService.post("/api/runtime/scenarios/" + scenario.id);
            };

            $scope.edit = function(scenario) {
                $state.go("dashboard.scenarios.edit", { scenario: scenario.id });
            };

            $scope.stopScenario = function(readableScenario) {
                apiService.delete("/api/runtime/scenarios/" + readableScenario.executionId);
            };

            sharedApiSocket.on("scenarios:updated", onScenariosUpdated);
            apiSocket.on("running-scenarios:updated", onRunningScenariosUpdated);

            $scope.$on("$destroy", function() {
                sharedApiSocket.removeListener("scenarios:updated", onScenariosUpdated);
            });

            onScenariosUpdated();
            onRunningScenariosUpdated();

            function onScenariosUpdated() {
                // retrieve the scenarios
                sharedApiService.get(util.format('/devices/%s/scenarios', APP_CONFIG.systemId))
                    .then(function(scenarios){
                        // then the runtime
                        apiService.get("/api/runtime/scenarios")
                            .then(function(response) {
                                let runningScenarios = response.data;
                                scenarios.forEach(function(scenario) {
                                    let running = _.find(runningScenarios, {id: scenario.id});
                                    if (running) {
                                        scenario.active = true;
                                    }
                                });
                                $timeout(function() {
                                    $scope.scenarios = scenarios;
                                });
                            });
                    });
            }

            function onRunningScenariosUpdated() {
                apiService.get("/api/runtime/scenarios/")
                    .then(function(data) {
                        $scope.runningScenarios = data.data;
                    });
            }
        });
})();