(function() {
    "use strict";

    angular
        .module('components.core')
        .directive('convertDate', function(APP_CONFIG, _){
            return {
                require: "ngModel",
                link: function($scope, $element, $attr, ngModel) {
                    ngModel.$formatters.push(function(modelValue) {
                        if (modelValue) {
                            return new Date(modelValue);
                        } else {
                            return modelValue;
                        }
                    });
                }
            }
        });
})();