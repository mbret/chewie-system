(function(){
    'use strict';

    angular
        .module('components.repository')
        .controller('RepositoryListController', function($scope, $rootScope, sharedApiService, util, auth, _, $uibModal, apiService, $log, APP_CONFIG){
            let vm = this;
            vm.plugins = [];
            vm.installed = [];

            // fetch plugins from local repository
            // We do not use sharedApiService as we need to talk with current server
            sharedApiService.get("/api/repositories/local/plugins")
                .then(function(data) {
                    vm.plugins = data;
                });

            // fetch saved plugins
            sharedApiService.get(util.format("/api/devices/%s/plugins", APP_CONFIG.systemId))
                .then(function(response) {
                    vm.installed = _.keyBy(response, "name");
                });

            vm.downloadFromGithub = function() {
                $uibModal.open({
                    animation: true,
                    templateUrl: '/app/components/repository/download-plugin-github.modal.tmpl.html',
                    controller: 'RepositoryModalDownloadGithub',
                    controllerAs: "$ctrl",
                    resolve: {}
                });
            }
        })
        .controller('LocalRepositoryDetailController', function($scope, $rootScope, sharedApiService, util, $stateParams, auth, apiService, $state, APP_CONFIG){
            $scope.plugin = null;
            let name = $stateParams.name;
            $scope.ready = false;
            $scope.installed = false;

            $scope.save = function() {
                let data = {
                    name: $scope.plugin.name,
                    version: $scope.plugin.version,
                    repository: "local",
                    package: $scope.plugin
                };
                sharedApiService.post(util.format("/devices/%s/plugins", APP_CONFIG.systemId), data)
                    .then(function() {
                        $state.go("dashboard.repository.list");
                    });
            };

            sharedApiService.get("/api/repositories/local/plugins/" + name)
                .then(function(data) {
                    $scope.plugin = data;
                });

            apiService.get(util.format("/api/plugins/%s", name))
                .then(function() {
                    $scope.installed = true;
                    $scope.ready = true;
                })
                .catch(function(err) {
                    if (err.status === 404) {
                        $scope.ready = true;
                    }
                });
        })
        .controller('InstalledRepositoryDetailController', function($scope, $rootScope, sharedApiService, util, $stateParams, auth, apiService, $state, APP_CONFIG){
            $scope.plugin = null;
            let name = $stateParams.name;
            $scope.ready = false;

            $scope.unSave = function() {
                sharedApiService.delete(util.format("/api/devices/%s/plugins/%s", APP_CONFIG.systemId, name))
                    .then(function() {
                        $state.go("dashboard.repository.list");
                    });
            };

            // Fetch details of plugin
            // sharedApiService.get("/api/repositories/local/plugins/" + name)
            //     .then(function(data) {
            //         $scope.plugin = data;
            //     });

            sharedApiService.get(util.format("/api/devices/%s/plugins/%s", APP_CONFIG.systemId, name))
                .then(function(response) {
                    $scope.plugin = response;
                    $scope.ready = true;
                })
                .catch(function(err) {
                    if (err.status === 404) {
                        $state.go("dashboard.repository.list");
                    }
                });
        })

        // Modals

        .controller("RepositoryModalDownloadGithub", function(apiService, $uibModalInstance) {
            let vm = this;
            vm.formData = {
                repoUrl: null
            };

            vm.cancel = function() {
                $uibModalInstance.close();
            };

            vm.confirm = function(form) {
                form.$setSubmitted();
                if (form.$valid) {
                    apiService.post("/api/plugins", { source: vm.formData.repoUrl });
                    $uibModalInstance.close();
                }
            }
        })
})();