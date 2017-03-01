(function() {
    "use strict";

    /**
     * It's important to provide a prefix to make fields name unique.
     */
    angular
        .module('components.core')
        .directive('moduleFormOptions', function(APP_CONFIG, _){
            return {
                require: ["^form", "ngModel"],
                scope: {
                    configOptions: '=',
                    options: '=ngModel',
                    prefix: '=prefix'
                },

                // which markup this directive generates
                templateUrl: '/app/components/core/module-form-options.directive.html',

                link: function($scope, $element, $attr, ctrls) {
                    $scope.form = ctrls[0];

                    if(!$scope.prefix){
                        console.error('no prefix provided');
                    }

                    $scope.$watch('configOptions', function(newValue){
                        _.forEach($scope.configOptions, function(option){

                            // set default values if the options has not been set yet
                            if(!$scope.options[option.name]){
                                $scope.options[option.name] = castValue(option.value, option.type);
                            }
                        });
                    });

                    function castValue(value, type) {
                        if (type === "number") {
                            return parseInt(value);
                        }

                        return value;
                    }
                }
            }
        });
})();