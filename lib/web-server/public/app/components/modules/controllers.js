(function(){
    'use strict';

    angular
        .module('components.modules')

        .controller('ModulesController', function($scope, $http, $uibModal, APP_CONFIG, $log, tasksService, notificationService){

            $scope.modules = [];

            tasksService.getAll().then(function(data){
                $scope.modules = data;
            });

        })

        .controller('ModulesConfigController', function($scope, $http, $uibModal, APP_CONFIG, $log, tasksService, $stateParams, notificationService){

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