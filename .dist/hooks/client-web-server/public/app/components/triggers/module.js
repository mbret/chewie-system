(function() {
    'use strict';

    angular.module('components.taskTriggers', [])

    .config(function($stateProvider) {

        $stateProvider

            // route for the about page
            .state('dashboard.taskTriggers', {
                url: '/task-triggers',
                abstract: true,
                controller: 'TaskTriggersController',
                templateUrl: '/app/components/triggers/index.html'
            })

            .state('dashboard.taskTriggers.list', {
                url: '/list',
                controller: 'TaskTriggersController',
                templateUrl: '/app/components/triggers/list.html'
            })

            .state('dashboard.taskTriggers.config', {
                url: '/:id/configuration',
                templateUrl: '/app/components/triggers/config.html',
                controller: 'TaskTriggersConfigController'
            })
    });
})();