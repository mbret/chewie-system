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
        console.log(formTask);

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
        .module('myBuddy')

        .controller('ModalAddTriggerTask', function($scope, $uibModalInstance, module, taskTrigger, tasksService){

            console.log(module);

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

        .controller('ModalAddInstantTask', function($scope, $uibModalInstance, module, $http, CONFIG, tasksService){

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
                    { value: 1, name: 'Lundi' },
                    { value: 2, name: 'Mardi' },
                    { value: 3, name: 'Mercredi' },
                    { value: 4, name: 'Jeudi' },
                    { value: 5, name: 'Vendredi' },
                    { value: 6, name: 'Samedi' },
                    { value: 7, name: 'Dimanche' },
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