(function() {
    'use strict';

    angular.module('components.tasksOld', [])

    .config(function($stateProvider) {

        $stateProvider

            // route for the about page
            .state('dashboard.tasksOld', {
                url: '/tasks',
                templateUrl : '/app/components/tasks/list.html',
                controller  : 'TasksController'
            })

            .state('dashboard.newTask', {
                url: '/new-task',
                templateUrl: '/app/components/tasks/new-task.html',
                controller: 'NewTaskController'
            })
    });
})();