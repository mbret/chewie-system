(function(){
    'use strict';

    /**
     * Modal
     * Add a new item.
     */
    angular
        .module("components.scenarios")
        .controller("CreateScenariosNewItemController", function($scope, $uibModalInstance, _, item, $uibModal, sharedApiService, authenticationService, util, apiService, APP_CONFIG) {
            $scope.triggers = [];
            $scope.tasks = [];
            $scope.triggerPlugins = [];
            $scope.triggersSelected = [];
            $scope.triggerSelected = null;
            $scope.tasksSelected = [];
            $scope.taskSelected = [];
            $scope.taskPlugins = [];
            $scope.plugins = {};
            $scope.formId = "form-scenario-item-create";
            // let newItem = null;
            // let newModal = null;
            // scenario
            $scope.formData = {
                name: item.name,
                pluginId: item.pluginId,
                type: item.type, // trigger / task
                moduleId: item.moduleId,
                id: item.id,
                configuration: item.configuration || {},
                options: item.options || {},
                nodes: item.nodes || []
            };

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.selectPlugin = function(type) {
                $scope.formData.moduleId = null;
                $scope.formData.type = type;
                if (type === "trigger") {
                    $scope.triggersSelected = getModules($scope.formData.type);
                } else {
                    $scope.tasksSelected = getModules($scope.formData.type);
                }
            };

            $scope.selectModule = function() {
                if ($scope.formData.type === "task") {
                    $scope.taskSelected = getModule($scope.formData.type, $scope.formData.moduleId);
                } else {
                    $scope.triggerSelected = getModule($scope.formData.type, $scope.formData.moduleId);
                }
            };

            $scope.confirm = function(form) {
                form.$setSubmitted();
                if (form.$valid) {
                    // use default values if needed
                    let data = _.extend({}, $scope.formData, {
                        name: $scope.formData.name || ($scope.formData.type === "task" ? $scope.taskSelected.name : $scope.triggerSelected.name)
                    });
                    $uibModalInstance.close(data);
                }
            };

            // $scope.select = function(item) {
            //     switch (item) {
            //
            //         case "action":
            //             newItem = _.merge(itemBase, {
            //                 title: null,
            //                 configuration: {
            //                     action: "start"
            //                 },
            //                 type: "action"
            //             });
            //             newModal = $uibModal.open({
            //                 animation: true,
            //                 templateUrl: '/app/components/scenarios/templates/create-action-configuration.modal.html',
            //                 controller: 'CreateScenariosConfigureActionController',
            //                 size: "sm",
            //                 resolve: {
            //                     action: newItem
            //                 }
            //             });
            //             newModal.result.then(function(newItem) {
            //                 $uibModalInstance.close(newItem);
            //             });
            //             break;
            //     }
            // };

            /**
             * Trigger selected
             * @param plugin
             */
            // $scope.trigger = function(plugin) {
            //     let pluginId = plugin.name;
            //     let triggers = _.filter($scope.triggers, function(trigger) {
            //         return trigger.plugin.name === pluginId;
            //     });
            //
            //     let modal = $uibModal.open({
            //         animation: true,
            //         templateUrl: '/app/components/scenarios/templates/new-item-trigger.modal.html',
            //         controller: 'CreateScenariosNewItemTriggerController',
            //         size: "sm",
            //         resolve: {
            //             triggers: function() {
            //                 return triggers;
            //             }
            //         }
            //     });
            //     modal.result.then(function(trigger) {
            //         newItem = _.merge(itemBase, {
            //             pluginId: trigger.plugin.name,
            //             moduleId: trigger.id,
            //             type: "trigger"
            //         });
            //         newModal = $uibModal.open({
            //             animation: true,
            //             templateUrl: '/app/components/scenarios/templates/node-trigger-configuration.modal.html',
            //             controller: 'CreateScenariosConfigureTriggerController',
            //             size: "lg",
            //             resolve: {
            //                 item: function() { return newItem; },
            //                 trigger: function() { return trigger; }
            //             }
            //         });
            //         newModal.result.then(function(newItem) {
            //             $uibModalInstance.close(newItem);
            //         });
            //     });
            // };

            // $scope.task = function(plugin) {
            //     var tasks = _.filter($scope.tasks, function(module) {
            //         return module.plugin.name === plugin.name;
            //     });
            //     // Pick up a task
            //     var modal = $uibModal.open({
            //         animation: true,
            //         templateUrl: '/app/components/scenarios/templates/new-item-task.modal.html',
            //         controller: 'scenarios.create.ChooseTaskController',
            //         size: "sm",
            //         resolve: {
            //             tasks: function() { return tasks; }
            //         }
            //     });
            //     modal.result.then(function(module) {
            //         newItem = _.merge(itemBase, {
            //             pluginId: module.plugin.name,
            //             moduleId: module.id,
            //             type: "task"
            //         });
            //         newModal = $uibModal.open({
            //             animation: true,
            //             templateUrl: '/app/components/scenarios/templates/create-task-configuration.modal.html',
            //             controller: 'CreateScenariosConfigureTaskController',
            //             size: "lg",
            //             resolve: {
            //                 item: function() { return newItem; },
            //                 module: function() { return module; }
            //             }
            //         });
            //         newModal.result.then(function(newItem) {
            //             $uibModalInstance.close(newItem);
            //         });
            //     });
            // };

            // fetch triggers
            sharedApiService.get(util.format('/api/devices/%s/plugins-modules', APP_CONFIG.systemId), { type: "trigger" })
                .then(function(data) {
                    $scope.triggers = data;
                    // build array of unique plugins key
                    $scope.triggers.forEach(function(trigger) {
                        $scope.triggerPlugins[trigger.plugin.name] = trigger.plugin;
                    });
                    $scope.triggerPlugins = _.values($scope.triggerPlugins);
                    $scope.triggersSelected = getModules($scope.formData.type);
                    $scope.triggerSelected = getModule($scope.formData.type, $scope.formData.moduleId);
                });

            // fetch tasks
            sharedApiService.get(util.format('/api/devices/%s/plugins-modules', APP_CONFIG.systemId), { type: "task" })
                .then(function(data) {
                    $scope.tasks = data;
                    // build array of unique key
                    $scope.tasks.forEach(function(module) {
                        $scope.taskPlugins[module.plugin.name] = module.plugin;
                    });
                    $scope.taskPlugins = _.values($scope.taskPlugins);
                    $scope.tasksSelected = getModules($scope.formData.type);
                    $scope.taskSelected = getModule($scope.formData.type, $scope.formData.moduleId);
                });

            sharedApiService.get("/api/devices/" + APP_CONFIG.systemId + "/plugins")
                .then(function(data) {
                    $scope.plugins = _.keyBy(data, "name");
                });

            function getModules(type) {
                if (type === "trigger") {
                    return _.filter($scope.triggers, function(trigger) {
                        return trigger.plugin.name === $scope.formData.pluginId;
                    });
                } else {
                    return _.filter($scope.tasks, function(module) {
                        return module.plugin.name === $scope.formData.pluginId;
                    });
                }
            }

            function getModule(type, moduleId) {
                if (type === "task") {
                    return _.find($scope.tasks, {id: moduleId});
                } else {
                    return _.find($scope.triggers, {id: moduleId});
                }
            }
        })
})();