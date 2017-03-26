(function(){
    'use strict';

    angular
        .module('components.hooks')

        .controller('HooksListController', function($scope, sharedApiService, apiService, APP_CONFIG, util){

            $scope.hooks = [];

            apiService.get('/api/hooks')
                .then(function(response) {
                    console.log(response);
                    $scope.hooks = response.data;
                })
                .catch(function(err) {
                    console.error(err);
                });
        });
})();