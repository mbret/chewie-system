(function(){
    'use strict';

    angular
        .module('components.tasks')

        .controller('TasksController', function($rootScope, $scope, $http, APP_CONFIG, TASK_TYPE, notificationService, apiService, tasksService, _, SweetAlert, auth){

            // http://stackoverflow.com/questions/8211744/convert-time-interval-given-in-seconds-into-more-human-readable-form
            $scope.tasks = [];
            $scope.scheduledTasks = [];
            $scope.triggeredTasks = [];

            apiService.get('/users/:id/modules'.replace(':id', auth.getUser().id), {type:'task-module'}).then(function(data){
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

        .controller('CreateController', function($scope, $http, $uibModal, APP_CONFIG, $log, tasksService, notificationService, apiService, auth){
            $scope.modules = [];

            apiService.get(sprintf('/users/%s/modules',auth.getUser().id), {type: 'task-module'}).then(function(response){
                $scope.modules = response;
            });
        })

        .controller('CreateFormController', function($scope, $stateParams, auth, $timeout, tasksService, $state, notificationService, _, apiService){
            $scope.module = null;

            // we will store all of our form data in this object
            $scope.formData = {
                name: 'My task',
                triggers: [
                    {
                        type: 'direct',
                        options: {},
                        // Depending of the type may also have attributes:
                        // .schedule
                        // .trigger
                        // .actions
                    }
                ]
            };

            // Contain all triggers available for task triggers
            $scope.triggers = [];

            // Get task module
            apiService
                .get(sprintf('/users/%s/plugins/%s/modules/%s', auth.getUser().id, $stateParams.plugin, $stateParams.module))
                .then(function(module){
                    $scope.module = module;
                });

            // Retrieve all the triggers
            apiService
                .get(sprintf('/users/%s/modules', auth.getUser().id), {type: 'trigger'})
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

            // function to process the form
            $scope.processForm = function(form) {
                form.submitted = true;
                if (!form.$valid) {
                    console.log(form.$error);
                    notificationService.warning('Your form has some errors');
                }
                else{

                    // create triggers from form
                    var triggers = [];
                    _.forEach($scope.formData.triggers, function(entry){

                        var trigger = {
                            type: entry.type,
                            options: transformOptions(entry.options),
                            messageAdapters: transformOutputActions(entry.actions)
                        };

                        if(trigger.type === 'trigger'){
                            trigger.trigger = {
                                id: entry.trigger.id,
                                options: transformOptions(entry.trigger.options)
                            };
                        }

                        triggers.push(trigger);
                    });

                    var task = {
                        module: $scope.module.id,
                        name: $scope.formData.name,
                        options: transformOptions($scope.formData.options),
                        triggers: triggers
                    };

                    apiService.post(sprintf('/users/%s/tasks', auth.getUser().id), task)
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


            function transformOptions(formOptions){
                var options = {};
                _.forEach(formOptions, function(opt){
                    options[opt.name] = opt.value;
                });
                return options;
            }

            function transformOutputActions(actions){
                var options = [];
                _.forEach(actions, function(action, key){
                    if(action === true){
                        options.push(key);
                    }
                });
                return options;
            }
        })
})();