(function(){
    "use strict";

    angular
        .module('components.scenarios')
        .directive('formNodesSelector', function($uibModal, _, sharedApiService, util, APP_CONFIG){
        return {
            restrict: 'E',
            scope: {
                nodes: "="
            },
            templateUrl: '/app/components/scenarios/form-nodes-selector.directive.html',
            link: function($scope, element) {
                $scope.tasks = [];
                $scope.triggers = [];

                // retrieve the tasks
                sharedApiService.get(util.format('/api/devices/%s/plugins-modules', APP_CONFIG.systemId), { type: "task" })
                    .then(function(data){
                        $scope.tasks = _.keyBy(data, "id");
                    });

                // fetch triggers
                sharedApiService.get(util.format('/api/devices/%s/plugins-modules', APP_CONFIG.systemId), { type: "trigger" })
                    .then(function(data){
                        $scope.triggers = _.keyBy(data, "id");
                    });

                $scope.newItem = function(item) {
                    let nodes = item ? item.nodes : $scope.nodes;
                    let modal = $uibModal.open({
                        animation: true,
                        templateUrl: '/app/components/scenarios/templates/new-item.modal.html',
                        controller: 'CreateScenariosNewItemController',
                        size: "sm",
                        resolve: {
                            id: item ? item.id * 10 + item.nodes.length : nodes.length + 1,
                            elements: function() {
                                return $scope.elements;
                            },
                        }
                    });
                    modal.result.then(function(newItem) {
                        nodes.push(newItem);
                    });
                };

                /**
                 *
                 * @param item
                 */
                $scope.configure = function(item) {
                    switch (item.type) {
                        case "trigger":
                            configureTrigger(item);
                            break;
                        case "action":
                            configureAction(item);
                            break;
                        case "task":
                            configureTask(item);
                            break;
                    }
                };

                /**
                 *
                 * @param item
                 */
                function configureTrigger(item) {
                    let modal = $uibModal.open({
                        animation: true,
                        templateUrl: '/app/components/scenarios/templates/node-trigger-configuration.modal.html',
                        controller: 'CreateScenariosConfigureTriggerController',
                        resolve: {
                            item: function() { return item; },
                            trigger: function() { return _.find($scope.triggers, {id: item.moduleId}); },
                        }
                    });
                }

                function configureTask(item) {
                    $uibModal.open({
                        animation: true,
                        templateUrl: '/app/components/scenarios/templates/create-task-configuration.modal.html',
                        controller: 'CreateScenariosConfigureTaskController',
                        resolve: {
                            item: function() { return item; },
                            module: function() { return _.find($scope.tasks, {id: item.moduleId}); },
                        }
                    });
                }

                /**
                 *
                 * @param item
                 */
                function configureAction(item) {
                    var modal = $uibModal.open({
                        animation: true,
                        templateUrl: '/app/components/scenarios/templates/create-action-configuration.modal.html',
                        controller: 'CreateScenariosConfigureActionController',
                        resolve: {
                            action: item
                        }
                    });
                    // modal.result.then(function(trigger) {
                    //     $scope.formData.triggers.push(trigger);
                    // });
                }
            }
        };
    });
})();