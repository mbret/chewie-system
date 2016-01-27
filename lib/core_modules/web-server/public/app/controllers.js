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

    .controller('TasksController', function($scope, $http, CONFIG){

        // http://stackoverflow.com/questions/8211744/convert-time-interval-given-in-seconds-into-more-human-readable-form
        $scope.modules = [];

        $http.get(CONFIG.apiUri + '/tasks', {}).then(function(response){
            $scope.modules = response.data;
            console.log($scope.modules);
        }, function(err){

        });

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
    });