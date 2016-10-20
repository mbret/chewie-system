(function(){
    'use strict';

    angular
        .module('components.repository')

        .controller('RepositoryController', function($scope, $rootScope, apiService, util){
            $scope.plugins = [];

            // fetch plugins from local repository
            // We do not use apiService as we need to talk with current server
            apiService.get("/api/repositories/local/plugins")
                .then(function(data) {
                    $scope.plugins = data;
                });
        });
})();