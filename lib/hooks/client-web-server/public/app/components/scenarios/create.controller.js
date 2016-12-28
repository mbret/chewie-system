(function(){
    'use strict';

    var taskScenarioId = 1;
    var elementId = 1;

    /**
     *
     */
    angular
        .module("components.scenarios")

        /**
         * Main page controller
         */
        .controller("CreateScenariosController", function ($scope, $uibModal, sharedApiService, auth, util, _, notificationService, apiService, APP_CONFIG) {
            $scope.formId = "form-scenario-create";
            $scope.elements = [];
            $scope.formData = {
                name: null,
                description: null,
                nodes: []
            };
            $scope.tasks = [];
            $scope.treeOptions = {
                removed: function(node) {
                    console.log(node.$modelValue);
                }
            };
            $scope.triggers = [];
            var modal = null;

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
             */
            $scope.newItem = function(item) {
                var nodes = item ? item.nodes : $scope.formData.nodes;
                var modal = $uibModal.open({
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
             * Use scope as convenience to get scope api
             * @param scope node scope
             */
            $scope.removeItem = function(scope) {
                scope.remove();
            };

            /**
             * Choose and include a new task reference.
             */
            $scope.addNewTaskRef = function() {
                modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/components/scenarios/templates/choose-task.modal.html',
                    controller: 'scenarios.create.ChooseTaskController',
                });
                modal.result.then(function(moduleId) {
                    $scope.elements.push({
                        type: "task",
                        moduleId: moduleId,
                        id: elementId++
                    });
                });
            };

            /**
             * Create a new scenario
             * @param form
             */
            $scope.confirm = function(form) {
                // extra validation
                if ($scope.formData.nodes.length === 0) {
                    form.content.$setValidity("required", false);
                } else {
                    form.content.$setValidity("required", true);
                }

                if (form.$valid) {
                    sharedApiService.post(util.format("/devices/%s/scenarios", APP_CONFIG.systemId), $scope.formData)
                        .then(function() {
                            notificationService.success("Created");
                        })
                        .catch(function(error) {
                            notificationService.error("Error: " + error.data.message);
                        });
                }
            };

            /**
             *
             * @param item
             */
            function configureTrigger(item) {
                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/components/scenarios/templates/create-trigger-configuration.modal.html',
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

            /**
             * Return the list of current task in node
             */
            // function getTaskList(nodes) {
            //     var tasks = [];
            //     nodes.forEach(function(item) {
            //          if (item.type === "task") {
            //              tasks.push(item);
            //          }
            //          tasks = tasks.concat(getTaskList(item.nodes));
            //     });
            //     return tasks;
            // }

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
        })

        /**
         * Modal
         * Add a new item.
         */
        .controller("CreateScenariosNewItemController", function($scope, $uibModalInstance, _, id, $uibModal, elements, sharedApiService, authenticationService, util, apiService, APP_CONFIG) {
            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };
            $scope.triggers = [];
            $scope.tasks = [];
            $scope.triggerPlugins = [];
            $scope.taskPlugins = [];
            var newItem = null;
            var newModal = null;
            var itemBase = {
                id: id,
                configuration: {},
                options: {},
                nodes: []
            };

            $scope.select = function(item) {
                switch (item) {

                    case "action":
                        newItem = _.merge(itemBase, {
                            title: null,
                            configuration: {
                                action: "start"
                            },
                            type: "action"
                        });
                        newModal = $uibModal.open({
                            animation: true,
                            templateUrl: '/app/components/scenarios/templates/create-action-configuration.modal.html',
                            controller: 'CreateScenariosConfigureActionController',
                            size: "sm",
                            resolve: {
                                action: newItem
                            }
                        });
                        newModal.result.then(function(newItem) {
                            $uibModalInstance.close(newItem);
                        });
                        break;
                }
            };

            /**
             * Trigger selected
             * @param plugin
             */
            $scope.trigger = function(plugin) {
                var pluginId = plugin.name;
                var triggers = _.filter($scope.triggers, function(trigger) {
                    return trigger.plugin.name === pluginId;
                });

                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/components/scenarios/templates/new-item-trigger.modal.html',
                    controller: 'CreateScenariosNewItemTriggerController',
                    size: "sm",
                    resolve: {
                        triggers: function() {
                            return triggers;
                        }
                    }
                });
                modal.result.then(function(trigger) {
                    newItem = _.merge(itemBase, {
                        pluginId: trigger.plugin.name,
                        moduleId: trigger.id,
                        type: "trigger"
                    });
                    newModal = $uibModal.open({
                        animation: true,
                        templateUrl: '/app/components/scenarios/templates/create-trigger-configuration.modal.html',
                        controller: 'CreateScenariosConfigureTriggerController',
                        size: "lg",
                        resolve: {
                            item: function() { return newItem; },
                            trigger: function() { return trigger; }
                        }
                    });
                    newModal.result.then(function(newItem) {
                        $uibModalInstance.close(newItem);
                    });
                });
            };

            $scope.task = function(plugin) {
                var tasks = _.filter($scope.tasks, function(module) {
                    return module.plugin.name === plugin.name;
                });
                // Pick up a task
                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/components/scenarios/templates/new-item-task.modal.html',
                    controller: 'scenarios.create.ChooseTaskController',
                    size: "sm",
                    resolve: {
                        tasks: function() { return tasks; }
                    }
                });
                modal.result.then(function(module) {
                    newItem = _.merge(itemBase, {
                        pluginId: module.plugin.name,
                        moduleId: module.id,
                        type: "task"
                    });
                    newModal = $uibModal.open({
                        animation: true,
                        templateUrl: '/app/components/scenarios/templates/create-task-configuration.modal.html',
                        controller: 'CreateScenariosConfigureTaskController',
                        size: "lg",
                        resolve: {
                            item: function() { return newItem; },
                            module: function() { return module; }
                        }
                    });
                    newModal.result.then(function(newItem) {
                        $uibModalInstance.close(newItem);
                    });
                });
            };

            // fetch triggers
            sharedApiService.get(util.format('/api/devices/%s/plugins-modules', APP_CONFIG.systemId), { type: "trigger" })
                .then(function(data) {
                    $scope.triggers = data;
                    // build array of unique key
                    $scope.triggers.forEach(function(trigger) {
                        $scope.triggerPlugins[trigger.plugin.name] = trigger.plugin;
                    });
                    $scope.triggerPlugins = _.values($scope.triggerPlugins);
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
                });
        })

        /**
         * Modal
         * Add a new item (trigger)
         */
        .controller("CreateScenariosNewItemTriggerController", function($scope, $uibModalInstance, _, $uibModal, triggers) {
            $scope.triggers = triggers;

            $scope.select = function(trigger) {
                $uibModalInstance.close(trigger);
            };

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };
        })

        /**
         * Modal
         * Configure a trigger item.
         */
        .controller("CreateScenariosConfigureTriggerController", function($scope, $uibModalInstance, item, trigger) {
            //$scope.schedules = {
            //    days: [
            //        { value: 0, name: 'Monday' },
            //        { value: 1, name: 'Tuesday' },
            //        { value: 2, name: 'Wednesday' },
            //        { value: 3, name: 'Thursday' },
            //        { value: 4, name: 'Friday' },
            //        { value: 5, name: 'Saturday' },
            //        { value: 6, name: 'Sunday' },
            //    ],
            //    dateRangePickerOptions: {
            //        singleDatePicker: true,
            //        timePicker: true,
            //        startDate: new Date(),
            //        locale: {
            //            format: 'YYYY-MM-DD h:mm A'
            //        },
            //        timePicker24Hour: true,
            //    }
            //};
            $scope.trigger = trigger;
            $scope.formData = {
                options: item.options,
                name: null
                //method: item.configuration.method,
                //schedule: {
                //    interval: 10,
                //    date: item.configuration.schedule.date,
                //    subMoment: item.configuration.schedule.subMoment
                //}
            };

            console.log(trigger);

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.confirm = function(form) {
                form.$setSubmitted();
                if (form.$valid) {
                    item.options = $scope.formData.options;
                    item.name = ($scope.formData.name !== null && $scope.formData.name.length > 0) ? $scope.formData.name : trigger.name;
                    $uibModalInstance.close(item);
                }
            };

            console.log(trigger, item);
        })

        /**
         * Modal
         * Configure a task item.
         */
        .controller("CreateScenariosConfigureTaskController", function($scope, $uibModalInstance, item, module) {
            $scope.module = module;
            $scope.formData = {
                options: item.options,
            };

            console.log(item, module);

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.confirm = function(form) {
                form.$setSubmitted();
                if (form.$valid) {
                    item.options = $scope.formData.options;
                    $uibModalInstance.close(item);
                }
            };
        })

        /**
         * Modal
         * Choose a task.
         */
        .controller("scenarios.create.ChooseTaskController", function($scope, sharedApiService, util, _, authenticationService, $uibModalInstance, tasks) {
            $scope.modules = tasks;

            $scope.select = function(module) {
                $uibModalInstance.close(module);
            };

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };
        });
})();