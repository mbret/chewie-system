(function(){
    'use strict';

    /**
     * Create a specific task.
     *
     * Url contain the plugin id and the module name.
     */
    angular
        .module('components.tasks')
        .controller('components.tasks.CreateFormController', function($scope, $stateParams, auth, $timeout, tasksService, $state, notificationService, _, sharedApiService){
            $scope.module = null;

            // we will store all of our form data in this object
            $scope.formData = {
                name: 'My task',
                description: '',
                triggers: [
                    {
                        type: 'manual',
                        options: {},
                        // Depending of the type may also have attributes:
                        // .schedule
                        // .trigger
                        // .actions
                    }
                ],
                options: {}
            };

            // Contain all triggers available for task triggers
            $scope.triggers = [];

            $scope.schedules = {
                days: [
                    { value: 0, name: 'Lundi' },
                    { value: 1, name: 'Mardi' },
                    { value: 2, name: 'Mercredi' },
                    { value: 3, name: 'Jeudi' },
                    { value: 4, name: 'Vendredi' },
                    { value: 5, name: 'Samedi' },
                    { value: 6, name: 'Dimanche' },
                ],
                dateRangePickerOptions: {
                    singleDatePicker: true,
                    timePicker: true,
                    timePicker24Hour: true,
                    eventHandlers: {
                        'apply.daterangepicker': function(ev, picker){
                            //console.log($scope.form.schedule.date);
                        }
                    }
                }
            };

            // Get task module details
            sharedApiService.get(`/users/${auth.getUser().id}/plugins/${$stateParams.plugin}/modules/${$stateParams.module}`)
                .then(function(module){
                    $scope.module = module;
                });

            // Retrieve all the triggers
            sharedApiService.get(`/users/${auth.getUser().id}/modules`, {type: 'trigger'})
                .then(function(data){
                    $scope.triggers = data;
                });

            $scope.addTrigger = function(){
                $scope.formData.triggers.push({
                    type: 'direct'
                });
            };

            $scope.removeTrigger = function(index){
                $scope.formData.triggers.splice(index, 1);
            };

            /**
             * Process the form
             * @param form
             */
            $scope.processForm = function(form) {
                form.submitted = true;
                if (!form.$valid) {
                    notificationService.warning('Your form has some errors');
                }
                else{

                    // create triggers from form
                    var triggers = [];
                    _.forEach($scope.formData.triggers, function(entry){

                        var trigger = {
                            type: entry.type,
                            options: entry.options,
                            outputAdapters: transformOutputActions(entry.actions)
                        };

                        if(trigger.type === 'trigger'){
                            trigger.trigger = {
                                id: entry.trigger.id,
                                options: entry.trigger.options
                            };
                        }

                        if(trigger.type === 'schedule'){

                            trigger.schedule = {
                                method: entry.schedule.method,
                                interval: entry.schedule.interval || null,
                            };

                            // More specific date
                            if(entry.schedule.subMoment === 'hours'){
                                trigger.schedule.hour = entry.schedule.time.getHours();
                                trigger.schedule.minute = entry.schedule.time.getMinutes();

                                // transform day of week
                                trigger.schedule.dayOfWeek = [];
                                _.forEach(entry.schedule.selectedDays, function(day){
                                    trigger.schedule.dayOfWeek.push(day.value);
                                });
                            }

                            // Specific date
                            if(entry.schedule.subMoment === 'date'){
                                trigger.schedule.date = entry.schedule.date;
                            }
                        }

                        triggers.push(trigger);
                    });

                    var task = {
                        module: $scope.module.id,
                        name: $scope.formData.name,
                        description: $scope.formData.description,
                        options: $scope.formData.options,
                        triggers: triggers
                    };

                    sharedApiService.post(`/users/${auth.getUser().id}/plugins/${$stateParams.plugin}/modules/${$stateParams.module}/tasks`, task)
                        .then(function(){
                            notificationService.success('Task created');
                            //$state.go('dashboard.tasks');
                        })
                        .catch(function(res){
                            if(res.status === 400){
                                notificationService.warning('Form invalid: ' + JSON.stringify(res.data.errors));
                            }
                        })
                }
            };

            // function transformOptions(formOptions){
            //     var options = {};
            //     _.forEach(formOptions, function(opt){
            //         options[opt.name] = opt.value;
            //     });
            //     return options;
            // }

            function transformOutputActions(actions){
                var options = [];
                _.forEach(actions, function(action, key){
                    if(action === true){
                        options.push(key);
                    }
                });
                return options;
            }
        });
})();