(function(){
    'use strict';

    /**
     *
     */
    angular
        .module('components.scenarios')
        .controller('IndexScenariosController', function($scope, sharedApiService, auth, util, _, apiService, mySocket, $log){

            $scope.scenarios = [];

            $scope.remove = function(scenario) {
                apiService.delete("/api/scenarios/" + scenario.id);
            };

            // retrieve the scenarios
            sharedApiService.get(util.format('/users/%s/scenarios', auth.getUser().id))
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
                        response.data.forEach(function(scenario) {
                            let tmp = _.find($scope.scenarios, {id: scenario.id});
                            tmp.active = true;
                        });
                    });
            }
        });
})();