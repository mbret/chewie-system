(function(){
    'use strict';

    angular
        .module('components.config')

        .controller('HomeController', function($scope, $http, toastr, APP_CONFIG, apiService, auth, mySocket, notificationService){

            $scope.activeSince = '...';
            $scope.externalServicesStatus = null;
            $scope.runProfiles = [];
            $scope.runProfile = null;
            $scope.runProfileLock = false;

            // This event is important after user logout
            // It ensure that the user may log again safely
            // When user logout several tasks may occurs on server like clean tasks / files / etc
            // We should only log user again when everything is ok to not corrupt system.
            mySocket.on('profile:started:completed', function(data) {
                $scope.runProfileLock = false;
            });

            mySocket.on('profile:stopped:completed', function(data) {
                $scope.runProfileLock = false;
                notificationService.success('Profile stopped');
            });

            // fetch external status
            apiService.get('/users/external-services-status/' + auth.getUser().id).then(function(res){
                $scope.externalServicesStatus = res;
            });

            apiService.get('/users').then(function(data){
                $scope.runProfiles = data;
            });

            apiService.get('/runtime/profile').then(function(data){
                $scope.runProfile = data;
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

            $scope.startProfile = function(id){
                apiService.post('/runtime/profile', {id: id}).then(function(data){
                    $scope.runProfileLock = true;
                    $scope.runProfile = data;
                    notificationService.success('Profile started');
                });
            };

            $scope.stopProfile = function(){
                apiService.delete('/runtime/profile').then(function(){
                    $scope.runProfileLock = true;
                    $scope.runProfile = null;
                });
            };
        });
})();