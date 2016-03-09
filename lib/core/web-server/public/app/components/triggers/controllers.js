(function(){
    'use strict';

    angular
        .module('components.taskTriggers')

        .controller('TaskTriggersController', function($scope, $http, $uibModal, APP_CONFIG, $log, triggersService, notificationService){

            $scope.modules = [];

            triggersService.fetchAll().then(function(data){
                $scope.modules = data;
            });

        })

        .controller('TaskTriggersConfigController', function($scope, $http, $uibModal, APP_CONFIG, $log, pluginsService, triggersService, $stateParams, notificationService, _){

            var id = $stateParams.id;
            $scope.module = [];
            $scope.options = [];

            triggersService.fetchOne(id).then(function(data){
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