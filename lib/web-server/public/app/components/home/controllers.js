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

            // fetch external status
            //apiService.get('/users/external-services-status/' + auth.getUser().id).then(function(res){
            //    $scope.externalServicesStatus = res;
            //});

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
                $scope.runProfileLock = true;
                apiService.post('/runtime/profile', {id: id})
                    .then(function(){
                        $scope.runProfile = id;
                    })
                    .finally(function(){
                        $scope.runProfileLock = false;
                    });
            };

            $scope.stopProfile = function(){
                $scope.runProfileLock = true;
                apiService.delete('/runtime/profile')
                    .then(function(){
                        $scope.runProfile = null;
                    })
                    .finally(function(){
                        $scope.runProfileLock = false;
                    })
            };
        });
})();