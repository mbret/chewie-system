(function(){
    'use strict';

    /**
     * Create a valid api task from the form scope task.
     * Basically do all the mapping.
     *
     * @param formTask
     * @returns {{messageAdapters: Array, options: {}}}
     */
    function createTaskFromForm(formTask){

        var options = {};
        _.forEach(formTask.options, function(option){
            options[option.name] = option.value;
        });

        var task = {
            messageAdapters: formTask.actions
                .filter(function(action){
                    return action.value;
                })
                .map(function(action){
                    return action.name;
                }),
            options: options
        };

        // we have a task on command
        if(formTask.triggerOptions){

            var triggerOptions = {};
            _.forEach(formTask.triggerOptions, function(option){
                triggerOptions[option.name] = option.value;
            });

            task.triggerOptions = triggerOptions;
        }

        return task;
    }

    angular
        .module('components.tasksOld')

        .controller('TasksController', function($rootScope, $scope, $http, APP_CONFIG, TASK_TYPE, notificationService, apiService, tasksService, _, SweetAlert){

            // http://stackoverflow.com/questions/8211744/convert-time-interval-given-in-seconds-into-more-human-readable-form
            $scope.tasks = [];
            $scope.scheduledTasks = [];
            $scope.triggeredTasks = [];

            apiService.get('/tasks', {}).then(function(data){
                $scope.tasks = data;
                $scope.scheduledTasks = _.filter($scope.tasks, {'type': TASK_TYPE.schedule});
                $scope.triggeredTasks = _.filter($scope.tasks, {'type': TASK_TYPE.trigger});
            });

            /**
             *
             */
            $scope.removeTask = function(id){
                SweetAlert.swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this imaginary file!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",confirmButtonText: "Yes, delete it!",
                        cancelButtonText: "No, cancel plx!",
                        closeOnConfirm: false,
                        closeOnCancel: true },
                    function(isConfirm){
                        if (isConfirm) {
                            //tasksService.remove(id)
                            //    .then(function(data){

                                    $rootScope.$apply(function(){
                                        _.remove($scope.scheduledTasks, function(task){
                                            console.log(task.id, id);
                                            return task.id === id;
                                        });
                                    });
                                    SweetAlert.swal("Deleted!", "Your imaginary file has been deleted.", "success");
                                //});
                        }
                    });
            }
        })

        .controller('NewTaskController', function($scope, $http, $uibModal, APP_CONFIG, $log, tasksService, notificationService){
            $scope.modules = [];

            tasksService.getAll().then(function(response){
                $scope.modules = response;
            });

            $scope.addInstantTask = function(size, module){
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: '/app/components/tasks/modals/add-instant-task.html',
                    controller: 'ModalAddInstantTask',
                    size: size,
                    resolve: {
                        module: function () {
                            return module;
                        }
                    }
                });

                modalInstance.result.then(function (task) {

                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };

            $scope.addScheduledTask = function (size, module) {

                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: '/app/components/tasks/modals/add-scheduled-task.html',
                    controller: 'ModalAddScheduledTask',
                    size: size,
                    resolve: {
                        module: function () {
                            return module;
                        }
                    }
                });

                modalInstance.result.then(function (task) {

                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };

            /**
             *
             * @param size
             * @param module
             */
            $scope.addTriggerTask = function(size, module){
                var modalInstance = $uibModal.open({
                    templateUrl: '/app/components/tasks/modals/task-triggers-select.html',
                    controller: function($scope, $uibModalInstance, module, $http, APP_CONFIG, apiService, _){

                        $scope.taskTriggers = [];

                        // get triggers
                        apiService.getTaskTriggers().then(function(results){
                            $scope.taskTriggers = results;
                        });

                        $scope.selectTrigger = function(pluginId, id){
                            var res = _.find($scope.taskTriggers, function(entry){
                                return entry.pluginId === pluginId && entry.id === id;
                            });
                            $uibModalInstance.close(res);
                        };

                        $scope.cancel = function () {
                            $uibModalInstance.dismiss('cancel');
                        };
                    },
                    size: size,
                    resolve: {
                        module: function () {
                            return module;
                        }
                    }
                });
                modalInstance.result.then(function (taskTrigger) {

                    var modalInstance = $uibModal.open({
                        templateUrl: '/app/components/tasks/modals/add-trigger-task.html',
                        controller: 'ModalAddTriggerTask',
                        size: size,
                        resolve: {
                            module: function () {
                                return module;
                            },
                            taskTrigger: function(){
                                return taskTrigger;
                            }
                        }
                    });
                    modalInstance.result.then(function (target) {
                        notificationService.success('Task created');
                    });

                });
            };

            $scope.addMovementTriggeredTask = function(size, module){
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: '/app/components/tasks/modals/add-movement-commanded-task.html',
                    controller: 'ModalAddMovementTriggeredTask',
                    size: size,
                    resolve: {
                        module: function () {
                            return module;
                        }
                    }
                });

                modalInstance.result.then(function (task) {

                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            }
        })

        .controller('ModalAddTriggerTask', function($scope, $uibModalInstance, module, taskTrigger, tasksService){

            $scope.module = module;
            $scope.taskTrigger = taskTrigger;
            $scope.task = {
                actions: null,
                options: null,
                triggerOptions: null,
            };

            $scope.submitForm = function (form) {

                if ($scope.form.$valid) {

                    var task = createTaskFromForm($scope.task);
                    task.trigger = {
                        pluginId: taskTrigger.pluginId,
                        id: taskTrigger.id
                    };

                    tasksService.create(task, 'trigger', module.name).then(function(){
                        $uibModalInstance.close($scope.task);
                    });
                }
                else{
                    alert('Formulaire invalid');
                }
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        })

        .controller('ModalAddInstantTask', function($scope, $uibModalInstance, module, $http, APP_CONFIG, tasksService){

            console.log(module);
            var self = this;

            $scope.module = module;
            $scope.task = {
                actions: null,
                options: null
            };

            $scope.submitForm = function (form) {

                if ($scope.form.$valid) {

                    var task = createTaskFromForm($scope.task);

                    tasksService.create(task, 'direct', module.name)
                        .then(function(){
                            $uibModalInstance.close($scope.task);
                        });

                }
                else{
                    alert('Formulaire invalid');
                }
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        })

        .controller('ModalAddScheduledTask', function($scope, $uibModalInstance, module, $http, tasksService, TASK_TYPE){

            var self = this;

            $scope.module = module;

            $scope.tabs = [
                { title:'Interval', content: 'interval.html', form: 'dsf' },
                { title:'Un moment', content: 'moment.html', form: 'sdf' }
            ];
            $scope.task = {
                actions: null,
                options: {},
            };
            $scope.schedule = {
                subMoment: null,
                method: 'interval',
                interval: null, // in second
                date: {
                    startDate: moment().subtract(1, "days"),
                    endDate: moment()
                },
                range: {
                    startDate: moment().subtract(1, "days"),
                    endDate: moment()
                },
                // days select multiple
                days: [
                    { value: 0, name: 'Lundi' },
                    { value: 1, name: 'Mardi' },
                    { value: 2, name: 'Mercredi' },
                    { value: 3, name: 'Jeudi' },
                    { value: 4, name: 'Vendredi' },
                    { value: 5, name: 'Samedi' },
                    { value: 6, name: 'Dimanche' },
                ],
                selectedDays: [],
                // for hours selection
                hours: new Date(moment().format('YYYY-MM-DD HH:mm:00'))
            };

            $scope.dateRangePickerOptions = {
                singleDatePicker: true,
                timePicker: true,
                timePicker24Hour: true,
                eventHandlers: {
                    'apply.daterangepicker': function(ev, picker){
                        console.log($scope.form.schedule.date);
                    }
                }
            };

            /**
             *
             * @param form
             */
            $scope.submitForm = function (form) {
                console.log($scope.task);
                if ($scope.form.$valid) {

                    var task = createTaskFromForm($scope.task);
                    task.schedule = {
                        method: $scope.schedule.method,
                        interval: $scope.schedule.interval ? $scope.schedule.interval * 1000 : null,
                    };
                    if($scope.schedule.subMoment === 'hours'){
                        task.schedule.when = [moment($scope.schedule.hours).format('HH:mm'), 'HH:mm', $scope.schedule.selectedDays.value];
                    }

                    tasksService
                        .create(task, TASK_TYPE.schedule, module.name)
                        .then(function(){
                            $uibModalInstance.close(task);
                        });
                }
                else{
                    alert('Formulaire invalid');
                }

            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        })

        .controller('ModalAddMovementTriggeredTask', function($scope, $uibModalInstance, module, tasksService){

            $scope.module = module;

            // task form
            $scope.task = {
                actions: null,
                optionsOnEnter: null,
                optionsOnExit: null,
                onEnter: true,
                onExit: false
            };

            $scope.submitForm = function (form) {

                if ($scope.form.$valid) {

                    var optionsOnEnter = {};
                    _.forEach($scope.task.optionsOnEnter, function(option){
                        optionsOnEnter[option.name] = option.value;
                    });

                    var optionsOnExit = {};
                    _.forEach($scope.task.optionsOnExit, function(option){
                        optionsOnExit[option.name] = option.value;
                    });

                    var task = {
                        messageAdapters: $scope.task.actions
                            // Keep only checked
                            .filter(function(action){
                                return action.value;
                            })
                            // Return only name
                            .map(function(action){
                                return action.name;
                            }),
                        optionsOnEnter: optionsOnEnter,
                        optionsOnExit: optionsOnExit
                    };

                    tasksService
                        .create(task, 'movement-command', module.name)
                        .then(function(){
                            $uibModalInstance.close($scope.task);
                        });

                }
                else{
                    alert('Formulaire invalid');
                }
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        });
})();