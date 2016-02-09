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
            });
    });
})();