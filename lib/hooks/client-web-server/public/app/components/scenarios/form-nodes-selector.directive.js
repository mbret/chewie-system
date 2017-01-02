(function(){
    "use strict";

    angular
        .module('components.scenarios')
        .directive('formNodesSelector', function($uibModal, _, sharedApiService, util, APP_CONFIG){
        return {
            restrict: 'E',
            require: "^form",
            scope: {
                nodes: "=",
            },
            templateUrl: '/app/components/scenarios/form-nodes-selector.directive.html',
            link: function($scope, element, attrs, form) {
                $scope.tasks = [];
                $scope.form = form;
                $scope.triggers = [];
                $scope.treeOptions = {
                    "data-drag-enabled": false,
                    removed: function(node) {
                        console.log(node.$modelValue);
                    }
                };

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

                $scope.newItem = function(parentItem) {
                    let nodes = parentItem ? parentItem.nodes : $scope.nodes;
                    let newItem = {
                        id: parentItem ? parentItem.id * 10 + parentItem.nodes.length : nodes.length + 1
                    };
                    let modal = $uibModal.open({
                        animation: true,
                        templateUrl: '/app/components/scenarios/create-scenarios-new-item.modal.html',
                        controller: 'CreateScenariosNewItemController',
                        size: "md",
                        resolve: {
                            item: () => newItem
                            // elements: function() {
                            //     return $scope.elements;
                            // },
                        }
                    });
                    modal.result.then(function(newItem) {
                        nodes.push(newItem);
                        console.log(newItem);
                    });
                };

                $scope.configure = function(item) {
                    let modal = $uibModal.open({
                        animation: true,
                        templateUrl: '/app/components/scenarios/create-scenarios-new-item.modal.html',
                        controller: 'CreateScenariosNewItemController',
                        size: "md",
                        resolve: {
                            item: () => item
                        }
                    });
                    modal.result.then(function(newItem) {
                         _.merge(item, newItem);
                    });
                    // switch (item.type) {
                    //     case "trigger":
                    //         configureTrigger(item);
                    //         break;
                    //     case "action":
                    //         configureAction(item);
                    //         break;
                    //     case "task":
                    //         configureTask(item);
                    //         break;
                    // }
                };

                /**
                 *
                 * @param item
                 */
                // function configureTrigger(item) {
                //     let modal = $uibModal.open({
                //         animation: true,
                //         templateUrl: '/app/components/scenarios/templates/node-trigger-configuration.modal.html',
                //         controller: 'CreateScenariosConfigureTriggerController',
                //         resolve: {
                //             item: function() { return item; },
                //             trigger: function() { return _.find($scope.triggers, {id: item.moduleId}); },
                //         }
                //     });
                // }

                // function configureTask(item) {
                //     $uibModal.open({
                //         animation: true,
                //         templateUrl: '/app/components/scenarios/templates/create-task-configuration.modal.html',
                //         controller: 'CreateScenariosConfigureTaskController',
                //         resolve: {
                //             item: function() { return item; },
                //             module: function() { return _.find($scope.tasks, {id: item.moduleId}); },
                //         }
                //     });
                // }

                /**
                 *
                 * @param item
                //  */
                // function configureAction(item) {
                //     var modal = $uibModal.open({
                //         animation: true,
                //         templateUrl: '/app/components/scenarios/templates/create-action-configuration.modal.html',
                //         controller: 'CreateScenariosConfigureActionController',
                //         resolve: {
                //             action: item
                //         }
                //     });
                //     // modal.result.then(function(trigger) {
                //     //     $scope.formData.triggers.push(trigger);
                //     // });
                // }
            }
        };
    });
})();