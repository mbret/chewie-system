(function() {
    'use strict';

    angular
        .module('components.scenarios', [
            "ui.tree"
        ])
        .config(function($stateProvider) {

            $stateProvider
                .state('dashboard.scenarios', {
                    url: '/scenarios',
                    abstract: true,
                    template : '<ui-view></ui-view>',
                    controller  : 'TasksController'
                })
                .state('dashboard.scenarios.index', {
                    url: '',
                    templateUrl : '/app/components/scenarios/templates/index.html',
                    controller  : 'IndexScenariosController'
                })
                .state('dashboard.scenarios.create', {
                    url: '/create',
                    templateUrl : '/app/components/scenarios/templates/create.html',
                    controller  : 'CreateScenariosController'
                })
                .state('dashboard.scenarios.edit', {
                    url: '/edit/:scenario',
                    templateUrl : '/app/components/scenarios/edit.html',
                    controller  : 'EditScenariosController'
                })
        });
})();