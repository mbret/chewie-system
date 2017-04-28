(function() {
    "use strict";

    angular.module("chewie.components", [
        "chewie.components.dashboard",
        'components.core',
        'components.auth',
        'components.tasks',
        'components.hooks',
        'components.screens',
        'components.taskTriggers',
        'components.repository',
        'components.home',
        'components.system',
        'components.profile',
        'components.playground',
        'components.scenarios',
        'components.plugins',
        'components.profileSelection',
        'components.settings',
    ]);
})();