(function(){
    'use strict';

    angular
        .module('components.tasks')

        .controller('TasksController', function($rootScope, $scope, $http, APP_CONFIG, TASK_TYPE, notificationService, apiService, tasksService, _, SweetAlert, auth, util){

            // http://stackoverflow.com/questions/8211744/convert-time-interval-given-in-seconds-into-more-human-readable-form
            $scope.tasks = [];
            $scope.scheduledTasks = [];
            $scope.triggeredTasks = [];

            apiService.get('/users/:id/modules'.replace(':id', auth.getUser().id), {type:'task-module'}).then(function(data){
                $scope.tasks = data;
                $scope.scheduledTasks = _.filter($scope.tasks, {'type': TASK_TYPE.schedule});
                $scope.triggeredTasks = _.filter($scope.tasks, {'type': TASK_TYPE.trigger});
            });

            console.log(util);
            apiService.get(util.format('/users/%s/tasks', auth.getUser().id)).then(function(data){
                $scope.tasks = data;
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
        });
})();