(function() {
    'use strict';

    angular.module('components.taskTriggers', [])

    .config(function($stateProvider) {

        $stateProvider

            // route for the about page
            .state('chewie.dashboard.taskTriggers', {
                url: '/task-triggers',
                abstract: true,
                controller: 'TaskTriggersController',
                templateUrl: '/app/components/triggers/index.html'
            })

            .state('chewie.dashboard.taskTriggers.list', {
                url: '/list',
                controller: 'TaskTriggersController',
                templateUrl: '/app/components/triggers/list.html'
            })

            .state('chewie.dashboard.taskTriggers.config', {
                url: '/:id/configuration',
                templateUrl: '/app/components/triggers/config.html',
                controller: 'TaskTriggersConfigController'
            })
    });
})();