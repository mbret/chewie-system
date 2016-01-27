'use strict';

angular.module('myBuddy')

    .directive('uiSrefActiveIf', ['$state', function($state) {
        return {
            restrict: "A",
            controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
                var state = $attrs.uiSrefActiveIf;

                console.log($state.is('df'));
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
    .directive('taskActions', function(CONFIG, messagesAdaptersService){
        return {
            scope: {
                actions: '=',
                //bindAttr: '='
            },

            // which markup this directive generates
            templateUrl: CONFIG.viewBaseUrl + '/directives/task-actions.html',

            link: function($scope, iElement, iAttrs) {

                $scope.actionCheckBox = true;

                $scope.actions = [];
                messagesAdaptersService
                    .getActions()
                    .then(function(actions){
                        _.forEach(actions, function(action){
                           $scope.actions.push({
                               text: action.displayName,
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

    .directive('taskOptions', function(CONFIG){
        return {
            scope: {
                module: '=',
                options: '='
            },

            // which markup this directive generates
            templateUrl: CONFIG.viewBaseUrl + '/directives/task-options.html',

            link: function($scope, iElement, iAttrs) {

                $scope.options = [];

                // build options for form
                _.forEach($scope.module.options, function(option){
                    $scope.options.push({
                        label: option.label,
                        name: option.name,
                        value: null,
                        type: option.type,
                        required: option.required
                    });
                });

                console.log($scope.options);

            }
        }
    })

    .directive('messageAdapterOptions', function(CONFIG, $timeout){
        return {
            scope: {
                options: '='
            },

            // which markup this directive generates
            templateUrl: CONFIG.viewBaseUrl + '/directives/message-adapter-options.html',

            link: function($scope, iElement, attrs) {
                //$scope.options = [];

                // Watch is needed as we cut the mapping in loop
                //$scope.$watch('options', function(newValue, oldValue) {
                    // build options for form
                //    $scope.options = [];
                //    _.forEach($scope.configOptions, function(option){
                //        $scope.options.push({
                //            label: option.label,
                //            name: option.name,
                //            value: option.value,
                //            type: option.type,
                //            required: option.required
                //        });
                //    });
                //}, true);

            }
        }
    });