(function() {
    "use strict";

    angular
        .module('app.shared')
        /**
         * Use like this:
         * require a form with [name] and a field with [name]
         * <form-errors form="myForm" field="myForm.myField"></form-errors>
         */
        .directive('formErrors', function(){
            return {
                restrict: "E",
                template: '' +
                '<div class="help-block" ng-messages="field.$error" ng-if="(field.$invalid && form.$submitted) || field.$dirty">' +
                    '<div ng-transclude></div> ' +
                    '<div ng-messages-include="form-messages"></div>' +
                '</div>',
                transclude: true,
                require: "^form",
                scope: {
                    field: '='
                },
                link: function($scope, iElement, iAttrs, formCtrl) {
                    $scope.form = formCtrl;
                    if(typeof $scope.field === 'string'){
                        console.error('You are using a string instead of object as scope.field');
                    }
                }
            }
        })
})();