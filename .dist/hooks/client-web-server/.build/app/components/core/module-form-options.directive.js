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
                    //$scope.options = [];

                    if(!$scope.prefix){
                        console.error('no prefix provided');
                    }

                    // console.log($scope.configOptions);

                    $scope.$watch('configOptions', function(newValue){
                        //if(Array.isArray(newValue)){
                        // build options for form
                        //$scope.options = [];
                        _.forEach($scope.configOptions, function(option){
                            //$scope.options.push({
                            //    label: option.label,
                            //    name: option.name,
                            //    value: option.default || null,
                            //    choices: option.choices || null,
                            //    type: option.type,
                            //    required: option.required
                            //});

                            // set default values
                            if(!$scope.options[option.name]){
                                $scope.options[option.name] = castValue(option.value, option.type);
                            }
                        });
                        //}

                        // console.log($scope.options);
                        // console.log($scope.configOptions);
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