'use strict';

angular.module('myBuddy')

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
            controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
                var state = $attrs.uiSrefActiveIf;

                function update() {
                    if ( $state.includes(state) || $state.is(state) ) {
                        $element.addClass("active");
                    } else {
                        $element.removeClass("active");
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
            scope: {
                //actions: '=',
                //bindAttr: '='
            },

            // which markup this directive generates
            templateUrl: APP_CONFIG.viewBaseUrl + '/directives/task-actions.html',

            link: function($scope, iElement, iAttrs) {
                $scope.actionCheckBox = true;

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
            templateUrl: APP_CONFIG.viewBaseUrl + '/directives/module-form-options.html',

            link: function($scope, $element, $attr, ctrls) {
                $scope.form = ctrls[0];
                $scope.options = [];

                if($scope.prefix === undefined){
                    console.error('no prefix provided');
                }

                $scope.$watch('configOptions', function(newValue){
                    if(Array.isArray(newValue)){
                        // build options for form
                        $scope.options = [];
                        _.forEach($scope.configOptions, function(option){
                            $scope.options.push({
                                label: option.label,
                                name: option.name,
                                value: option.default || null,
                                type: option.type,
                                required: option.required
                            });
                        });
                    }
                });
            }
        }
    })

    //.directive('moduleFormOptions', function(APP_CONFIG, triggersService){
    //    return {
    //        require: ["^form", "ngModel"],
    //        scope: {
    //            configOptions: '=',
    //            options: '=ngModel',
    //            prefix: '=prefix'
    //        },
    //
    //        // which markup this directive generates
    //        templateUrl: APP_CONFIG.viewBaseUrl + '/directives/trigger-options.html',
    //
    //        link: function($scope, iElement, iAttrs, ctrls) {
    //            $scope.form = ctrls[0];
    //            $scope.options = [];
    //
    //            triggersService.fetchAll().then(function(data){
    //                // build options for form
    //                _.forEach(data, function(option){
    //                    $scope.options.push({
    //                        label: option.label,
    //                        name: option.name,
    //                        value: null,
    //                        type: option.type,
    //                        required: option.required
    //                    });
    //                });
    //            });
    //
    //            console.log($scope.options);
    //
    //        }
    //    }
    //})

    //.directive('pluginOptions', function(APP_CONFIG, $timeout){
    //    return {
    //        scope: {
    //            options: '='
    //        },
    //
    //        // which markup this directive generates
    //        templateUrl: APP_CONFIG.viewBaseUrl + '/directives/plugin-options.html',
    //
    //        link: function($scope, iElement, attrs) {
    //            //$scope.options = [];
    //
    //            // Watch is needed as we cut the mapping in loop
    //            //$scope.$watch('options', function(newValue, oldValue) {
    //                // build options for form
    //            //    $scope.options = [];
    //            //    _.forEach($scope.configOptions, function(option){
    //            //        $scope.options.push({
    //            //            label: option.label,
    //            //            name: option.name,
    //            //            value: option.value,
    //            //            type: option.type,
    //            //            required: option.required
    //            //        });
    //            //    });
    //            //}, true);
    //
    //        }
    //    }
    //});