(function(){
    'use strict';

    var module = angular.module(angular.module('app.buddy').componentsNamespace + ".profileSelection");

    module
        .controller(module.name + '.IndexController', function($rootScope, $scope){
            $rootScope.bodyClasses = 'gray-bg';

            $scope.profiles = [0,1,2,3,4,5,6];
        });
})();