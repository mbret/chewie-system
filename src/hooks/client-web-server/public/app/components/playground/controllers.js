(function () {
  'use strict'

  angular
    .module('chewie.components')

    .controller('ComponentsPlaygroundIndexController', function ($scope, apiService, toastr, APP_CONFIG, sharedApiService) {

      $scope.speechText = ''

      $scope.speak = function (text) {
        if (text !== '') {
          sharedApiService.post('/speak', {text: text})
        }
      }

      $scope.testSound = function () {
        apiService.post('/api/system/sound', {resourcePath: 'system/test_sound.wav'})
      }
    })
})()