(function(){
    'use strict';

    angular
        .module('components.home')

        .controller('HomeController', function($scope, $http, toastr, APP_CONFIG, apiService, auth, mySocket, notificationService, $interval, util){

            $scope.externalServicesStatus = null;
            $scope.runProfiles = [];
            $scope.runProfile = null;
            $scope.runProfileLock = false;

            $interval(function(){
                $scope.activeSince = new Date().getTime() - new Date(APP_CONFIG.systemInfo.startedAt).getTime();
            }, 1000);

            // fetch external status
            apiService.get(util.format('/users/%s/external-services', auth.getUser().getId())).then(function(res){
                $scope.externalServicesStatus = res.status;
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
                    });
            };

            $scope.testSound = function(){
                apiService.post('/system/sound', { resourcePath: 'system/test_sound.wav'});
            };
        });
})();