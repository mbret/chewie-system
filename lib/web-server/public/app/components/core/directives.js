'use strict';

var path = '/app/components/core';

angular.module('components.core')

    /**
     * Use like this:
     * require a form with [name] and a field with [name]
     * <form-errors form="myForm" field="myForm.myField"></form-errors>
     */
    .directive('formErrors', function(){
        return {
            restrict: "E",
            template: '' +
            '<div class="help-block" ng-messages="field.$error" ng-if="(field.$invalid && form.submitted) || field.$dirty">' +
                '<div ng-messages-include="form-messages"></div>' +
            '</div>',
            scope: {
                form: '=',
                field: '='
            },
            link: function($scope, iElement, iAttrs) {
                if(typeof $scope.field === 'string'){
                    console.error('You are using a string instead of object as scope.field');
                }
            }
        }
    })

    .directive('uiSrefActiveIf', ['$state', function($state) {
        return {
            restrict: "A",
            scope: {
                uiSrefActiveIf: '='
            },
            controller: ['$scope', '$element', '$attrs', '$rootScope', function ($scope, $element, $attrs, $rootScope) {
                var states = $scope.uiSrefActiveIf;

                if(states === undefined){
                    throw new Error('Undefined states in uiSrefActiveIf attribute');
                }

                if(!Array.isArray(states)){
                    states = [states];
                }

                function update() {
                    for(var i = 0; i < states.length; i++){
                        if ( $state.includes(states[i]) || $state.is(states[i]) ) {
                            $element.addClass("active");
                            break;
                        } else {
                            $element.removeClass("active");
                        }
                    }
                }

                $scope.$on('$stateChangeSuccess', update);
                update();
            }]
        };
    }])

    // http://blog.revolunet.com/blog/2013/11/28/create-resusable-angularjs-input-component/
    .directive('taskActions', function(APP_CONFIG, messagesAdaptersService, _){
        return {
            require: ["ngModel"],
            scope: {
                model: '=ngModel',
                //actions: '=',
                //bindAttr: '='
            },

            // which markup this directive generates
            templateUrl: path + '/directives/task-actions.html',

            link: function($scope, iElement, iAttrs) {

                // by default, required -> true
                $scope.actionCheckBox = true;

                $scope.model = {};
                $scope.actions = [];

                messagesAdaptersService
                    .getActions()
                    .then(function(actions){
                        _.forEach(actions, function(action){
                           $scope.actions.push({
                               text: action.config.displayName,
                               value: false,
                               name: action.name
                           });
                            $scope.model[action.name] = false;
                        });
                    });

                $scope.actionCheckboxChange = function(){
                    $scope.actionCheckBox = $scope.actions.every(function(itm) {
                        return !itm.value;
                    });
                };
            }
        }
    })

    /**
     * It's important to provide a prefix to make fields name unique.
     */
    .directive('moduleFormOptions', function(APP_CONFIG){
        return {
            require: ["^form", "ngModel"],
            scope: {
                configOptions: '=',
                options: '=ngModel',
                prefix: '=prefix'
            },

            // which markup this directive generates
            templateUrl: path + '/directives/module-form-options.html',

            link: function($scope, $element, $attr, ctrls) {
                $scope.form = ctrls[0];
                //$scope.options = [];

                if(!$scope.prefix){
                    console.error('no prefix provided');
                }

                console.log($scope.configOptions);

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
                                $scope.options[option.name] = option.default;
                            }
                        });
                    //}


                    console.log($scope.options);
                    console.log($scope.configOptions);
                });
            }
        }
    })

    .directive('ngLockable', function($compile){
        return {
            restrict: 'E',
            transclude: true,
            scope: { isLock: '=ngLockable' },
            template: '' +
            '<div class="lockable animated fadeIn" ng-if="isLock">' +
                '<div class="lockable-wrapper ">' +
                    '<div class="sk-spinner sk-spinner-double-bounce">' +
                    '<div class="sk-double-bounce1"></div>' +
                    '<div class="sk-double-bounce2"></div>' +
                '</div>' +
                '</div>' +
            '</div>' +
            '<ng-transclude></ng-transclude>',
            link: function(scope, element, attrs) {
                element.css('position', 'relative');
                element.css('display', 'block');
                element.css('height', '100%');
                element.css('width', '100%');
            }
        }
    });