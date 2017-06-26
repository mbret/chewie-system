(function (window, angular) {
  'use strict'

  function configState ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider
      .when('', '/dashboard/home')

    $stateProvider
      .state('chewie', {
        abstract: true,
        templateUrl: '/app/app.html'
      })
      .state('speech', {
        url: '/speech',
        controller: 'SpeechController',
        templateUrl: '/app/components/speech/speech.html'
      })
  }

  angular
    .module('chewie')
    .config(configState)

})(window, window.angular)