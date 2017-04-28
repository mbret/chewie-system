(function() {
    "use strict";

    function settings($stateProvider) {
        $stateProvider
            .state('chewie.dashboard.settings', {
                url: '/settings',
                templateUrl :'/app/components/settings/settings.index.html',
                controller  : 'ComponentsSettingsController',
            });
    }

    angular.module("components.settings")
        .config(settings);
})();