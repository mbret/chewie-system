(function () {
  'use strict'

  angular
    .module('chewie.components')
    .config(function ($stateProvider) {
      $stateProvider.state('chewie.dashboard.home', {
        url: '/home',
        templateUrl: 'app/components/home/index.html',
        controller: 'components.home.HomeController'
      })
    })
})()