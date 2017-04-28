(function() {
    'use strict';

    angular
        .module('components.scenarios', [
            "ui.tree"
        ])
        .config(function($stateProvider) {

            $stateProvider
                .state('chewie.dashboard.scenarios', {
                    url: '/scenarios',
                    abstract: true,
                    template : '<ui-view></ui-view>',
                    controller  : 'TasksController'
                })
                .state('chewie.dashboard.scenarios.index', {
                    url: '',
                    templateUrl : '/app/components/scenarios/index.html',
                    controller  : 'IndexScenariosController'
                })
                .state('chewie.dashboard.scenarios.create', {
                    url: '/create',
                    templateUrl : '/app/components/scenarios/scenarios-create.html',
                    controller  : 'CreateScenariosController'
                })
                .state('chewie.dashboard.scenarios.edit', {
                    url: '/edit/:scenario',
                    templateUrl : '/app/components/scenarios/edit.html',
                    controller  : 'EditScenariosController'
                })
        });
})();