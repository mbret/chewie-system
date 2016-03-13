'use strict';

angular.module('components.core')

    .controller('IndexController', function($scope, $http, toastr, APP_CONFIG, apiService){

        $scope.activeSince = '...';
        $scope.externalServicesStatus = null;

        // fetch external status
        apiService.user.getExternalStatus().then(function(res){
            $scope.externalServicesStatus = res;
        });

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

    .controller('MessagesAdaptersController', function($scope, $http, APP_CONFIG, apiService){

    })

    .controller('MessagesAdaptersListController', function($scope, $http, APP_CONFIG, apiService){
        $scope.adapters = [];
        apiService.get('/messages-adapters', {}).then(function(data){
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

    .controller('CoreModulesController', function($scope, $http, $uibModal, APP_CONFIG, $log, pluginsService){
        $scope.modules = [];

        pluginsService.getCoreModules().then(function(data){
            console.log(data);
            var modules = data;
            $scope.modules = modules;
        });
    })

    .controller('SpeechController', function($scope, apiService, annyang, APP_CONFIG, _, notificationService){

        var commands = {

        };

        // Load commands
        apiService.get('/speech/commands').then(function(entries){
            _.forEach(entries, function(entry){
                console.log(entry);

                // Create a new command with its correct api call to execute
                commands[entry.command] = function(){
                   apiService.post('/speech/commands', {command: entry.command});
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

    .controller('CoreModulesDetailConfigController', function($scope, $http, $uibModal, APP_CONFIG, $log, pluginsService, $stateParams, notificationService){

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
                    notificationService.success('Saved');
                });
        };
    });