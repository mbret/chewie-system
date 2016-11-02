(function(){
    'use strict';

    angular
        .module('components.home')

        .controller('ComponentsPlaygroundIndexController', function($scope, $http, toastr, APP_CONFIG, apiService, auth, mySocket, notificationService, $interval, util, googleApi){

            $scope.speechText = "";

            $scope.speak = function(text) {
                if(text !== "") {
                    apiService.post('/speak', { text: text });
                }
            };

            $scope.testSound = function(){
                apiService.post('/system/sound', { resourcePath: 'system/test_sound.wav'});
            };
        });
})();