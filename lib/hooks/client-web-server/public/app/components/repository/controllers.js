(function(){
    'use strict';

    angular
        .module('components.repository')
        .controller('RepositoryListController', function($scope, $rootScope, sharedApiService, util, auth, _, $uibModal){
            let vm = this;
            vm.plugins = [];
            vm.saved = [];

            // fetch plugins from local repository
            // We do not use sharedApiService as we need to talk with current server
            sharedApiService.get("/api/repositories/local/plugins")
                .then(function(data) {
                    vm.plugins = data;
                });

            // fetch saved plugins
            sharedApiService.get(util.format("/api/users/%s/plugins", auth.user.id))
                .then(function(data) {
                    vm.saved = _.keyBy(data, "name");
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
        .controller('RepositoryDetailController', function($scope, $rootScope, sharedApiService, util, $stateParams, auth, $timeout){
            $scope.plugin = null;
            let name = $stateParams.name;
            $scope.saved = null;
            $scope.ready = false;

            $scope.unSave = function() {
                sharedApiService.delete(util.format("/api/users/%s/plugins/%s", auth.user.id, name))
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
                sharedApiService.post(util.format("/api/users/%s/plugins", auth.user.id), data)
                    .then(function(data) {
                        $scope.saved = true;
                    });
            };

            sharedApiService.get("/api/repositories/local/plugins/" + name)
                .then(function(data) {
                    $scope.plugin = data;
                });

            sharedApiService.get(util.format("/api/users/%s/plugins/%s", auth.user.id, name))
                .then(function() {
                    $scope.saved = true;
                    $scope.ready = true;
                })
                .catch(function(err) {
                    if (err.status === 404) {
                        $scope.ready = true;
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