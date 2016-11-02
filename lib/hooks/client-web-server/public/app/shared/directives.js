(function(){
    "use strict";

    var module = angular.module('app.shared');

    /**
     * slimScroll - Directive for slimScroll with custom height
     * http://rocha.la/jQuery-slimScroll
     */
    module.directive('slimScroll', function($timeout){
        return {
            restrict: 'A',
            scope: {
                slimScrollHeight: '@'
            },
            link: function(scope, element) {
                $timeout(function(){
                    element.slimscroll({
                        height: scope.slimScrollHeight, // default 250px
                        railOpacity: 0.9
                    });
                });
            }
        };
    });
})();