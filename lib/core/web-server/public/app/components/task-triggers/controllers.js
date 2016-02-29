(function(){
    'use strict';

    angular
        .module('components.taskTriggers')

        .controller('TaskTriggersController', function($scope, $http, $uibModal, APP_CONFIG, $log, taskTriggersService, notificationService){

            $scope.modules = [];

            taskTriggersService.fetchAll().then(function(data){
                $scope.modules = data;
            });

        })

        .controller('TaskTriggersConfigController', function($scope, $http, $uibModal, APP_CONFIG, $log, tasksService, $stateParams, notificationService){

            var id = $stateParams.id;
            $scope.module = [];
            $scope.options = [];

            tasksService.getModule(id).then(function(data){
                $scope.module = data;

                // extract options
                _.forEach($scope.module.config.options, function(entry){
                    var option = entry;

                    // get possible value of this option
                    if($scope.module.userOptions[option.name]){
                        option.value = $scope.module.userOptions[option.name];
                    }

                    $scope.options.push(option);
                });
            });

            $scope.submit = function() {
                var options = {};

                _.forEach($scope.options, function(option){
                    options[option.name] = option.value;
                });

                var data = {
                    options: options
                };

                tasksService
                    .updateModuleOptions(id, data)
                    .then(function(){
                        notificationService.success('Saved');
                    });
            };
        });
})();