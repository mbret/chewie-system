(function () {
  'use strict'

  function configState ($stateProvider) {
    $stateProvider
      .state('chewie.dashboard', {
        abstract: true,
        url: '/dashboard',
        templateUrl: '/app/components/dashboard/dashboard-index.html',
        controller: 'DashboardController',
        resolve: {
          auth: authenticationService => authenticationService.resolveAuth()
        },
        onEnter: function ($rootScope) {
          $rootScope.bodyClasses = ''
        }
      })
  }

  angular.module('chewie.components.dashboard', [])
    .config(configState)
})()