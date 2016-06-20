(function() {
    'use strict';

    angular.module('screens.default', [
        'ui.bootstrap',
        'ui.bootstrap.tabs',
        'ui.bootstrap.tpls',
        'ui.router',
        "monospaced.qrcode",
        "app.shared",
    ])

        .constant("_", _)

        .config(function($locationProvider, $urlRouterProvider, $stateProvider) {

            $locationProvider.html5Mode(true).hashPrefix('!');

            $urlRouterProvider.otherwise("/board");

            $stateProvider.state('home', {
                url: '/board',
                controller: 'ScreensDefaultIndexController',
                templateUrl: 'public/index.html'
            });

            $stateProvider.state('message', {
                url: '/message',
                controller: 'ScreensDefaultMessageController',
                templateUrl: 'public/message.html'
            });
        })

        .config(function (apiServiceProvider) {
            apiServiceProvider.setApiUri("https://localhost:3001");
        })

        /**
         * slimScroll - Directive for slimScroll with custom height
         * http://rocha.la/jQuery-slimScroll
         */
        .directive('slimScroll', function($timeout){
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
        })

        .run(function(screensService, $rootScope, $state){

        });
})();