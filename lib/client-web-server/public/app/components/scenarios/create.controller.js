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
        .controller("CreateScenariosController", function ($scope, $uibModal, apiService, auth, util, _, notificationService) {
            $scope.formId = "form-scenario-create";
            $scope.elements = [];
            $scope.formData = {
                name: "test",
                description: "qsd",
                nodes: []
            };
            $scope.tasks = {};
            $scope.treeOptions = {
                removed: function(node) {
                    console.log(node.$modelValue);
                }
            };
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
                modal.result.then(function(taskId) {
                    $scope.elements.push({
                        type: "task",
                        taskId: taskId,
                        id: elementId++
                    });
                });
            };

            /**
             *
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
                    apiService.post(util.format("/users/%s/scenarios", auth.getUser().id), $scope.formData)
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
                        trigger: item
                    }
                });
                // modal.result.then(function(trigger) {
                //     $scope.formData.triggers.push(trigger);
                // });
            }

            function configureTask(item) {
                $uibModal.open({
                    animation: true,
                    templateUrl: '/app/components/scenarios/templates/create-task-configuration.modal.html',
                    controller: 'CreateScenariosConfigureTaskController',
                    resolve: {
                        item: function() {
                            return item;
                        },
                        elements: function() {
                            return $scope.elements.filter(function(element) {
                                return element.type === "task";
                            });
                        },
                        tasks: function() {
                            return $scope.tasks;
                        }
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
            apiService.get(util.format('/users/%s/tasks', auth.getUser().id))
                .then(function(data){
                    $scope.tasks = _.keyBy(data, "id");
                });
        })

        /**
         * Modal
         * Add a new item.
         */
        .controller("CreateScenariosNewItemController", function($scope, $uibModalInstance, _, id, $uibModal, elements, apiService, authenticationService, util) {
            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };
            $scope.triggers = [];
            $scope.triggerPlugins = [];
            var newItem = null;
            var newModal = null;
            var itemBase = {
                id: id,
                configuration: {},
                nodes: []
            };

            $scope.select = function(item) {
                switch (item) {

                    case "trigger":
                        newItem = _.merge(itemBase, {
                            title: "My new trigger",
                            type: "trigger",
                            configuration: {
                                method: "moment",
                                schedule: {
                                    date: new Date(),
                                    subMoment: "date"
                                }
                            }
                        });
                        newModal = $uibModal.open({
                            animation: true,
                            templateUrl: '/app/components/scenarios/templates/create-trigger-configuration.modal.html',
                            controller: 'CreateScenariosConfigureTriggerController',
                            size: "lg",
                            resolve: {
                                trigger: newItem
                            }
                        });
                        newModal.result.then(function(newItem) {
                            $uibModalInstance.close(newItem);
                        });
                        break;

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

                    // A task is either a new task for the scenario or an existing scenario task
                    case "task":
                        newItem = _.merge(itemBase, {
                            title: "My new task",
                            type: "task",
                            element: null,
                            configuration: {
                                id: taskScenarioId++,
                                taskId: null
                            }
                        });
                        newModal = $uibModal.open({
                            animation: true,
                            templateUrl: '/app/components/scenarios/templates/create-task-configuration.modal.html',
                            controller: 'CreateScenariosConfigureTaskController',
                            size: "lg",
                            resolve: {
                                item: newItem,
                                elements: function() {
                                    return elements.filter(function(element) {
                                        return element.type === "task";
                                    });
                                },
                            }
                        });
                        newModal.result.then(function(newItem) {
                            $uibModalInstance.close(newItem);
                        });
                        break;
                }
            };

            // Display triggers from plugin
            $scope.trigger = function(pluginId) {

            };

            // fetch triggers
            apiService.get(util.format('/users/%s/modules', authenticationService.getUser().id), { type: "trigger" })
                .then(function(data){
                    $scope.triggers = data;
                    // build array of unique key
                    $scope.triggers.forEach(function(trigger) {
                        $scope.triggerPlugins[trigger.plugin.id] = trigger.plugin;
                    });
                    $scope.triggerPlugins = _.values($scope.triggerPlugins);
                });
        })

        /**
         * Modal
         * Configure a trigger item.
         */
        .controller("CreateScenariosConfigureTriggerController", function($scope, $uibModalInstance, trigger) {
            $scope.schedules = {
                days: [
                    { value: 0, name: 'Monday' },
                    { value: 1, name: 'Tuesday' },
                    { value: 2, name: 'Wednesday' },
                    { value: 3, name: 'Thursday' },
                    { value: 4, name: 'Friday' },
                    { value: 5, name: 'Saturday' },
                    { value: 6, name: 'Sunday' },
                ],
                dateRangePickerOptions: {
                    singleDatePicker: true,
                    timePicker: true,
                    startDate: new Date(),
                    locale: {
                        format: 'YYYY-MM-DD h:mm A'
                    },
                    timePicker24Hour: true,
                }
            };
            $scope.formData = {
                method: trigger.configuration.method,
                schedule: {
                    interval: 10,
                    date: trigger.configuration.schedule.date,
                    subMoment: trigger.configuration.schedule.subMoment
                },
            };

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.confirm = function(form) {
                form.$setSubmitted();
                if (form.$valid) {
                    // update current item
                    trigger.configuration.method = $scope.formData.method;
                    switch (trigger.configuration.method) {
                        case "moment":
                            trigger.configuration.schedule.date = $scope.formData.schedule.date;
                            trigger.configuration.schedule.subMoment = $scope.formData.schedule.subMoment;
                            break;
                        case "interval":
                            trigger.configuration.schedule.interval = $scope.formData.schedule.interval;
                            break;
                    }
                    $uibModalInstance.close(trigger);
                }
            };
        })

        /**
         * Modal
         * Configure an action item.
         */
        .controller("CreateScenariosConfigureActionController", function($scope, $uibModalInstance, action) {
            $scope.action = action;
            $scope.formData = {
                action: action.configuration.action
            };
            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.confirm = function(form) {
                form.$setSubmitted();
                if (form.$valid) {
                    // update current item
                    action.configuration.action = $scope.formData.action;
                    $uibModalInstance.close(action);
                }
            };
        })

        /**
         * Modal
         * Configure a task item.
         */
        .controller("CreateScenariosConfigureTaskController", function($scope, $uibModalInstance, item, elements, _) {
            var firstElementId = _.isEmpty(elements) ? null : String(elements[0].id);
            $scope.task = item;
            $scope.elements = elements;
            // $scope.tasks = tasks;
            $scope.formData = {
                elementId: item.element ? String(item.element.id) : firstElementId
            };

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.confirm = function(form) {
                form.$setSubmitted();
                if (form.$valid) {
                    // update current item
                    item.element = _.find(elements, {id: parseInt($scope.formData.elementId)});
                    $uibModalInstance.close(item);
                }
            };
        })

        /**
         * Modal
         * Choose a task.
         */
        .controller("scenarios.create.ChooseTaskController", function($scope, apiService, util, _, authenticationService, $uibModalInstance) {
            $scope.tasks = [];
            $scope.formData = {
                taskId: null
            };
            apiService.get(util.format('/users/%s/tasks', authenticationService.getUser().id))
                .then(function(data){
                    $scope.tasks = data;
                });

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.confirm = function(form) {
                form.$setSubmitted();
                if (form.$valid) {
                    $uibModalInstance.close($scope.formData.taskId);
                }
            };
        });
})();