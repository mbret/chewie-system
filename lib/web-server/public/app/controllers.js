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

    .controller('MessagesAdaptersController', function($scope, $http, CONFIG, apiService){

    })

    .controller('MessagesAdaptersListController', function($scope, $http, CONFIG, apiService){
        $scope.adapters = [];
        apiService.get(CONFIG.apiUri + '/messages-adapters', {}).then(function(data){
            $scope.adapters = data;
        }, function(err){
            console.error(err);
        });

    })

    .controller('MessagesAdaptersDetailController', function($scope, $stateParams, messagesAdaptersService, $timeout){

        var id = $stateParams.id;
        $scope.adapter = [];
        $scope.options = [];

        messagesAdaptersService.get(id).then(function(adapter){
            console.log(adapter);
            $scope.adapter = adapter;

            _.forEach($scope.adapter.config.options, function(entry){
                var option = entry;
                if($scope.adapter.userOptions[option.name]){
                    option.value = $scope.adapter.userOptions[option.name];
                }
                $scope.options.push(option);
            });
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
    })

    .controller('CoreModulesController', function($scope, $http, $uibModal, CONFIG, $log, pluginsService){
        $scope.modules = [];

        pluginsService.getCoreModules().then(function(data){
            console.log(data);
            var modules = data;
            $scope.modules = modules;
        });
    })

    .controller('CoreModulesDetailConfigController', function($scope, $http, $uibModal, CONFIG, $log, pluginsService, $stateParams){

        var id = $stateParams.id;
        $scope.coreModule = [];
        $scope.options = [];

        pluginsService.getCoreModule(id).then(function(data){
            $scope.coreModule = data;

            _.forEach($scope.coreModule.config.options, function(entry){
                var option = entry;
                if($scope.coreModule.userOptions[option.name]){
                    option.value = $scope.coreModule.userOptions[option.name];
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

            pluginsService
                .updateCoreModuleOptions(id, data)
                .then(function(){
                    console.log('saved');
                });
        };
    });