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

    .controller('MessagesAdaptersDetailController', function($scope, $stateParams, messagesAdaptersService, $timeout, pluginsService, notificationService){

        var id = $stateParams.id;
        $scope.adapter = [];
        $scope.options = [];

        messagesAdaptersService.get(id).then(function(adapter){
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

            _.forEach($scope.options, function(option){
                options[option.name] = option.value;
            });

            var data = {
                options: options
            };

            pluginsService
                .updateMessageAdapterOptions($scope.adapter.pluginId, id, data)
                .then(function(){
                    notificationService.success('Saved');
                });
        };
    })

    .controller('ModulesController', function($scope, $http, $uibModal, CONFIG, $log, tasksService, notificationService){
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

        /**
         *
         * @param size
         * @param module
         */
        $scope.addTriggerTask = function(size, module){
            var modalInstance = $uibModal.open({
                templateUrl: CONFIG.viewBaseUrl + '/modals/task-triggers-select.html',
                controller: function($scope, $uibModalInstance, module, $http, CONFIG, apiService, _){

                    $scope.taskTriggers = [];

                    // get triggers
                    apiService.getTaskTriggers().then(function(results){
                        $scope.taskTriggers = results;
                    });

                    $scope.selectTrigger = function(pluginId, id){
                        var res = _.find($scope.taskTriggers, function(entry){
                            return entry.pluginId === pluginId && entry.id === id;
                        });
                        $uibModalInstance.close(res);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: size,
                resolve: {
                    module: function () {
                        return module;
                    }
                }
            });
            modalInstance.result.then(function (taskTrigger) {

                var modalInstance = $uibModal.open({
                    templateUrl: CONFIG.viewBaseUrl + '/modals/add-trigger-task.html',
                    controller: 'ModalAddTriggerTask',
                    size: size,
                    resolve: {
                        module: function () {
                            return module;
                        },
                        taskTrigger: function(){
                            return taskTrigger;
                        }
                    }
                });
                modalInstance.result.then(function (target) {
                    notificationService.success('Task created');
                });

            });
        };

        $scope.addMovementTriggeredTask = function(size, module){
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: CONFIG.viewBaseUrl + '/modals/add-movement-commanded-task.html',
                controller: 'ModalAddMovementTriggeredTask',
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

    .controller('SpeechController', function($scope, apiService, annyang, CONFIG, _, notificationService){

        var commands = {

        };

        // Load commands
        apiService.get(CONFIG.apiUri + '/speech/commands').then(function(entries){
            _.forEach(entries, function(entry){
                console.log(entry);

                // Create a new command with its correct api call to execute
                commands[entry.command] = function(){
                   apiService.post(CONFIG.apiUri + '/speech/commands', {command: entry.command});
                }
            });

            annyang.addCommands(commands);

            // Annyang start for some time and if nothing is catch it start again
            annyang.addCallback('start', function (userSaid, commandText, phrases) {
                console.log('start');
            });

            annyang.addCallback('stop', function (userSaid, commandText, phrases) {
                console.log('stop');
            });

            annyang.addCallback('resultMatch', function (userSaid, commandText, phrases) {
                console.log(userSaid);
                console.log(commandText);
                console.log(phrases);
                notificationService.success('Command ' + commandText + ' recognized');
            });

            annyang.addCallback('result', function (possiblePhrases) {
                console.log(possiblePhrases);
                annyang.abort();
                //annyang.resume();
            });

            // Start listening. You can call this here, or attach this call to an event, button, etc.
            annyang.start({
                continuous: true
            });
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