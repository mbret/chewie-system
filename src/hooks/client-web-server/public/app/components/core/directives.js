'use strict';

var path = '/app/components/core';

angular.module('components.core')

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
    .directive('taskActions', function(APP_CONFIG, _, sharedApiService){
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

                // Retrieve all the output adapters
                sharedApiService.get(util.format('/users/%s/modules', auth.getUser().id), {type: 'output-adapter'})
                    .then(function(data){
                        $scope.triggers = data;
                    });
                //sharedApiService.get('')
                //    .then(function(actions){
                //        _.forEach(actions, function(action){
                //           $scope.actions.push({
                //               text: action.config.displayName,
                //               value: false,
                //               name: action.name
                //           });
                //            $scope.model[action.name] = false;
                //        });
                //    });

                $scope.actionCheckboxChange = function(){
                    $scope.actionCheckBox = $scope.actions.every(function(itm) {
                        return !itm.value;
                    });
                };
            }
        }
    })

    .directive('ngLockable', function() {
        return {
            restrict: 'A',
            transclude: true,
            scope: {
                isLock: '=ngLockable'
            },
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
                // element.css('width', '100%'); // pose des soucis sur les contact card par exemple. Voir si vraiment utile
            }
        }
    });