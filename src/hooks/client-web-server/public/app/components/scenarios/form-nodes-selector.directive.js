(function(){
    "use strict";

    angular
        .module('components.scenarios')
        .directive('formNodesSelector', directive);

    function directive($uibModal, _, sharedApiService, util, APP_CONFIG){
        return {
            restrict: 'E',
            require: "^form",
            scope: {
                nodes: "=",
            },
            templateUrl: '/app/components/scenarios/form-nodes-selector.directive.html',
            link: function($scope, element, attrs, form) {
                $scope.form = form;
                $scope.treeOptions = {
                    "data-drag-enabled": false,
                    removed: function(node) {
                        console.log("node removed", node.$modelValue);
                    }
                };

                // fetch all plugins
                sharedApiService.get("/api/devices/" + APP_CONFIG.systemId + "/plugins")
                    .then(function(response) {
                        let tmp = response.map(function(plugin) {
                            return _.merge({}, plugin, {
                                modules:  _.keyBy(plugin.package.modules, "id")
                            });
                        });
                        $scope.plugins = _.keyBy(tmp, "name");
                    });

                $scope.newItem = function(parentItem) {
                    let nodes = parentItem ? parentItem.nodes : $scope.nodes;
                    let newItem = {
                        id: parentItem ? parentItem.id * 10 + parentItem.nodes.length : nodes.length + 1
                    };
                    let modal = $uibModal.open({
                        animation: true,
                        templateUrl: '/app/components/scenarios/scenarios-configure-node.modal.html',
                        controller: 'CreateScenariosNewItemController',
                        size: "md",
                        resolve: {
                            item: () => newItem
                        }
                    });
                    modal.result.then(function(newItem) {
                        nodes.push(newItem);
                    });
                };

                $scope.newExistingItem = function(parentItem) {
                    let nodes = parentItem ? parentItem.nodes : $scope.nodes;
                    let newItem = {
                        id: parentItem ? parentItem.id * 10 + parentItem.nodes.length : nodes.length + 1
                    };
                    let modal = $uibModal.open({
                        animation: true,
                        templateUrl: '/app/components/scenarios/scenarios-form-node-add-existing-scenario.modal.html',
                        controller: 'components.scenarios.FormNodeAddExistingScenario',
                        size: "md",
                        resolve: {
                            item: () => newItem
                        }
                    });
                    modal.result.then(function(newItem) {
                        nodes.push(newItem);
                    });
                };

                $scope.configure = function(item) {
                    let modal = $uibModal.open({
                        animation: true,
                        templateUrl: '/app/components/scenarios/scenarios-configure-node.modal.html',
                        controller: 'CreateScenariosNewItemController',
                        size: "md",
                        resolve: {
                            item: () => item
                        }
                    });
                    modal.result.then(function(newItem) {
                        _.extend(item, newItem);
                    });
                };
            }
        };
    }
})();