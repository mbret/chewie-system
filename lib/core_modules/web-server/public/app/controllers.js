'use strict';

angular.module('myBuddy')

    .controller('IndexController', function($scope, $http, toastr, CONFIG, apiService){

        $scope.activeSince = '...';

        $scope.shutdown = function(){
            apiService.shutdown().then(function(){
                toastr.success('Buddy bien arrêté');
            });
        };

        $scope.restart = function(){
            apiService.restart().then(function(){
                toastr.success('Buddy redémarre ...');
            });
        };

        apiService.systemInfo().then(function(data){
            $scope.activeSince = new Date().getTime() - new Date(data.startedAt).getTime();
        });
    })

    .controller('PluginsController', function PluginsController($scope, pluginsService){

        $scope.plugins = [];

        pluginsService.getPlugins()
            .then(function(plugins){
                $scope.plugins = plugins;
            });
    })

    .controller('TasksController', function($scope, $http, CONFIG, TASK_TYPE, notificationService, apiService, tasksService){

        // http://stackoverflow.com/questions/8211744/convert-time-interval-given-in-seconds-into-more-human-readable-form
        $scope.tasks = [];
        $scope.scheduledTasks = [];

        $http.get(CONFIG.apiUri + '/tasks', {}).then(function(response){
            $scope.tasks = response.data;
            $scope.scheduledTasks = _.filter($scope.tasks, {'type': TASK_TYPE.schedule});
            console.log($scope.scheduledTasks);
        }, function(err){

        });

        /**
         *
         */
        $scope.removeTask = function(id){
            tasksService.remove(id)
                .then(function(data){
                    _.remove($scope.scheduledTasks, function(task){
                        console.log(task.id, id);
                        return task.id === id;
                    });

                    notificationService.success('Task deleted');
                });
        }
    })

    .controller('MessagesAdaptersDetailController', function($scope, $stateParams, messagesAdaptersService, $timeout){
        $scope.adapter = {
            name: $stateParams.id,
            options: null
        };

        messagesAdaptersService.get($stateParams.id)
            .then(function(adapter){
                $scope.adapter.options = adapter.config.options;
                _.forEach($scope.adapter.options, function(option){
                    option.value = adapter.options[option.name];
                })
            });

        $scope.submit = function() {
            var options = {};
            _.forEach($scope.adapter.options, function(option){
                options[option.name] = option.value;
            });
            var data = {
                options: options
            };
            messagesAdaptersService
                .put($stateParams.id, data)
                .then(function(){
                    console.log('saved');
                });
        };
    })

    .controller('ModulesController', function($scope, $http, $uibModal, CONFIG, $log, tasksService){
        $scope.modules = [];

        tasksService.getAll().then(function(response){
            console.log(response.data);
            var modules = response.data;
            $scope.modules = modules;
        });

        $scope.addInstantTask = function(size, module){
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: CONFIG.viewBaseUrl + '/modals/add-instant-task.html',
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
                templateUrl: CONFIG.viewBaseUrl + '/modals/add-scheduled-task.html',
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

        $scope.addMovementCommandedTask = function(size, module){
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: CONFIG.viewBaseUrl + '/modals/add-movement-commanded-task.html',
                controller: 'ModalAddMovementCommandedTask',
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
    });