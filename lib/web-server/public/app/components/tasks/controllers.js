(function(){
    'use strict';

    angular
        .module('components.tasks')

        .controller('TasksController', function(){

        })

        .controller('TasksListController', function($rootScope, $scope, $http, APP_CONFIG, TASK_TYPE, notificationService, apiService, tasksService, _, SweetAlert, auth, util){

            // http://stackoverflow.com/questions/8211744/convert-time-interval-given-in-seconds-into-more-human-readable-form
            $scope.tasks = [];
            $scope.scheduledTasks = [];
            $scope.triggeredTasks = [];

            apiService.get('/users/:id/modules'.replace(':id', auth.getUser().id), {type:'task-module'}).then(function(data){
                $scope.tasks = data;
                $scope.scheduledTasks = _.filter($scope.tasks, {'type': TASK_TYPE.schedule});
                $scope.triggeredTasks = _.filter($scope.tasks, {'type': TASK_TYPE.trigger});
            });

            apiService.get(util.format('/users/%s/tasks', auth.getUser().id)).then(function(data){
                $scope.tasks = data;

                $scope.tasks.forEach(function(task){
                    task.locked = false;
                    task.running = false;
                });

                // runtime tasks are obligatory related to current user
                // so the db tasks match the runtime tasks
                // Runtime tasks allow us to get extra information about triggers like nextInvocation
                apiService.get('/runtime/tasks').then(function(data){

                    // merge runtime task with user tasks
                    _.forEach($scope.tasks, function(task, i){
                        // try to find runtime task
                        var tmpIndex = _.findIndex(data, {id: task.id});

                        // The task may not exist if it is not active
                        if(tmpIndex === -1){
                            return;
                        }

                        var tmp = data[tmpIndex];

                        // merge triggers
                        // the db tasks should match the runtime tasks
                        _.forEach(task.triggers, function(trigger, j){
                            var tmpTrigger = tmp.triggers[_.findIndex(tmp.triggers, {id: trigger.id})];
                            task.triggers[j] = _.merge(trigger, tmpTrigger);
                        });

                        task.running = true;
                    });
                });
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

            $scope.toggleTaskActive = function(task){
                task.locked = true;
                if(task.running){
                    apiService.delete(util.format('/runtime/tasks/%s', task.id))
                        .then(function(){
                            task.running = false;
                            return true;
                            //return apiService.put(util.format('/users/%s/tasks/%s', auth.getUser().id, task.id), {active: false});
                        })
                        .then(function(){
                            task.locked = false;
                        })
                        .catch(function(err){
                            task.locked = false;
                        });
                }
                else{
                    Promise
                        .all([
                            // start for runtime
                            apiService.post('/runtime/tasks', {id: task.id})
                                .then(function(){
                                    task.running = true;
                                    return Promise.resolve();
                                }),
                            // set active to db
                            apiService.put(util.format('/users/%s/tasks/%s', auth.getUser().id, task.id), {active: true})
                                .then(function(){

                                })
                        ])
                        .then(function(){
                            task.locked = false;
                        })
                        .catch(function(err){
                            task.locked = false;
                        });
                }
            }
        })

        .controller('CreateController', function($scope, $http, $uibModal, APP_CONFIG, $log, tasksService, notificationService, apiService, auth){
            $scope.modules = [];

            apiService.get(sprintf('/users/%s/modules',auth.getUser().id), {type: 'task-module'}).then(function(response){
                $scope.modules = response;
            });
        });
})();