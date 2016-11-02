(function(){
    'use strict';

    angular
        .module('components.repository')
        .controller('RepositoryListController', function($scope, $rootScope, apiService, util, auth, _){
            $scope.plugins = [];
            $scope.saved = [];

            // fetch plugins from local repository
            // We do not use apiService as we need to talk with current server
            apiService.get("/api/repositories/local/plugins")
                .then(function(data) {
                    $scope.plugins = data;
                });

            // fetch saved plugins
            apiService.get(util.format("/api/users/%s/plugins", auth.user.id))
                .then(function(data) {
                    $scope.saved = _.keyBy(data, "name");
                });
        })
        .controller('RepositoryDetailController', function($scope, $rootScope, apiService, util, $stateParams, auth, $timeout){
            $scope.plugin = null;
            let name = $stateParams.name;
            $scope.saved = null;
            $scope.ready = false;

            $scope.unSave = function() {
                apiService.delete(util.format("/api/users/%s/plugins/%s", auth.user.id, name))
                    .then(function() {
                        $scope.saved = false;
                    });
            };

            $scope.save = function() {
                let data = {
                    name: $scope.plugin.name,
                    version: $scope.plugin.version,
                    repository: "local",
                    package: $scope.plugin
                };
                apiService.post(util.format("/api/users/%s/plugins", auth.user.id), data)
                    .then(function(data) {
                        $scope.saved = true;
                    });
            };

            apiService.get("/api/repositories/local/plugins/" + name)
                .then(function(data) {
                    $scope.plugin = data;
                });

            apiService.get(util.format("/api/users/%s/plugins/%s", auth.user.id, name))
                .then(function() {
                    $scope.saved = true;
                    $scope.ready = true;
                })
                .catch(function(err) {
                    if (err.status === 404) {
                        $scope.ready = true;
                    }
                });
        });
})();