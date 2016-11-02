(function() {
    'use strict';

    angular
        .module('components.repository', [])
        .config(function($stateProvider) {
            $stateProvider
                .state('dashboard.repository', {
                    url: '/repository',
                    abstract: true,
                    template : '<ui-view></ui-view>',
                })
                .state('dashboard.repository.list', {
                    url: '/list',
                    controller: 'RepositoryListController',
                    templateUrl: '/app/components/repository/index.html'
                })
                .state("dashboard.repository.detail", {
                    url: "/detail/:name",
                    controller: "RepositoryDetailController",
                    templateUrl: '/app/components/repository/detail.html'
                });
        });
})();