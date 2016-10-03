(function(){
    'use strict';

    /**
     *
     */
    angular
        .module('components.scenarios')
        .controller('IndexScenariosController', function($scope, apiService, auth, util){

            $scope.scenarios = [];

            // retrieve the scenarios
            apiService.get(util.format('/users/%s/scenarios', auth.getUser().id))
                .then(function(data){
                    $scope.scenarios = data;
                });
        });
})();