(function() {
    'use strict';

    angular.module('components.tasks', [])

    .config(function($stateProvider) {

        $stateProvider

            // route for the about page
            .state('dashboard.tasks', {
                url: '/tasks',
                abstract: true,
                template : '<ui-view></ui-view>',
                controller  : 'TasksController'
            })

            .state('dashboard.tasks.list', {
                url: '/list',
                templateUrl : '/app/components/tasks/list.html',
            })

            .state('dashboard.tasks.create', {
                url: '/create',
                templateUrl: '/app/components/tasks/new-task.html',
                controller: 'CreateController'
            })

            .state('dashboard.tasks.createForm', {
                url: '/create/:id',
                templateUrl: '/app/components/tasks/forms/steps.html',
                controller: 'CreateFormController'
            })
    });
})();