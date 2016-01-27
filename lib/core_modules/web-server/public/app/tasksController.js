/**
 * Created by maxime on 11/15/2015.
 */
angular
    .module('myBuddy')

    .controller('ModalAddInstantTask', function($scope, $uibModalInstance, module, $http, CONFIG, tasksService){

        var self = this;

        $scope.module = module;
        $scope.task = {
            actions: null,
            options: null
        };

        $scope.submitForm = function (form) {

            if ($scope.form.$valid) {

                var options = {};
                _.forEach($scope.task.options, function(option){
                    options[option.name] = option.value;
                });

                var task = {
                    messageAdapters: $scope.task.actions
                        .filter(function(action){
                            return action.value;
                        })
                        .map(function(action){
                            return action.name;
                        }),
                    options: options
                };

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

    .controller('ModalAddScheduledTask', function($scope, $uibModalInstance, module, $http, tasksService){

        var self = this;

        $scope.module = module;

        $scope.tabs = [
            { title:'Interval', content: 'interval.html', form: 'dsf' },
            { title:'Un moment', content: 'moment.html', form: 'sdf' }
        ];
        $scope.actionCheckBox = true;
        $scope.task = {
            type: 'schedule',
            task: {
                actions: [
                    {
                        text: 'Parler',
                        value: false,
                        name: 'speak'
                    },
                    {
                        text: 'Ecrire',
                        value: false,
                        name: 'write'
                    },
                ],
                options: {},
            },
            schedule: {
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
            }
        };

        $scope.dateRangePickerOptions = {
            singleDatePicker: true,
            timePicker: true,
            timePicker24Hour: true,
            eventHandlers: {
                'apply.daterangepicker': function(ev, picker){
                    console.log($scope.task.schedule.date);
                }
            }
        };

        _.forEach(module.options, function(option){
            $scope.task.task.options[option.name] = null;
        });

        $scope.actionCheckboxChange = function(){
            $scope.actionCheckBox = $scope.task.task.actions.every(function(itm) {
                return !itm.value;
            });
        };

        /**
         *
         * @param form
         */
        $scope.submitForm = function (form) {
            console.log(form, $scope.task);

            if ($scope.form.$valid) {

                var task = {
                    messageAdapters: $scope.task.task.actions
                        .filter(function(action){
                            return action.value;
                        })
                        .map(function(action){
                            return action.name;
                        }),
                    options: $scope.task.task.options,
                    schedule: {
                        method: $scope.task.schedule.method,
                        interval: $scope.task.schedule.interval ? $scope.task.schedule.interval * 1000 : null,
                    }
                };
                if($scope.task.schedule.subMoment === 'hours'){
                    task.schedule.when = [moment($scope.task.schedule.hours).format('HH:mm'), 'HH:mm', $scope.task.schedule.selectedDays.value];
                }

                console.log(moment($scope.task.hours), $scope.task.hours, $scope.task, task);

                tasksService
                    .create(task, 'schedule', module.name)
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

    .controller('ModalAddMovementCommandedTask', function($scope, $uibModalInstance, module, tasksService){

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