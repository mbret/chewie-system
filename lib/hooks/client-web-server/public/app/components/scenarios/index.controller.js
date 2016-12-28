(function(){
    'use strict';

    /**
     *
     */
    angular
        .module('components.scenarios')
        .controller('IndexScenariosController', function($scope, $state, sharedApiService, auth, util, _, apiService, mySocket, $log, APP_CONFIG, alerts){

            $scope.scenarios = [];

            $scope.remove = function(scenario) {
                alerts.confirm()
                    .then(function(confirm) {
                        if(confirm) {
                            sharedApiService.delete("/scenarios/" + scenario.id);
                        }
                    });
            };

            $scope.edit = function(scenario) {
                $state.go("dashboard.scenarios.edit", { scenario: scenario.id });
            };

            // retrieve the scenarios
            sharedApiService.get(util.format('/devices/%s/scenarios', APP_CONFIG.systemId))
                .then(function(data){
                    onScenariosUpdated(data);
                });

            $scope.$on("$destroy", function() {
                mySocket.removeListener("scenarios:updated", onScenariosUpdated);
            });

            mySocket.on("scenarios:updated", onScenariosUpdated);

            function onScenariosUpdated(scenarios) {
                $scope.scenarios = scenarios;

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
                    });
            }
        });
})();