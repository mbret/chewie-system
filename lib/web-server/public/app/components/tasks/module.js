(function() {
    'use strict';

    angular.module('components.tasks', [])

    .config(function($stateProvider) {

        $stateProvider

            // route for the about page
            .state('dashboard.tasks', {
                url: '/tasks',
                templateUrl : '/app/components/tasks/tasks.html',
                controller  : 'TasksController'
            })

            .state('dashboard.newTask', {
                url: '/new-task',
                templateUrl: '/app/components/tasks/new-task.html',
                controller: 'NewTaskController'
            })
    });
})();