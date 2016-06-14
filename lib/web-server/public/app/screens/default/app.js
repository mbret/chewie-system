(function() {
    'use strict';

    angular.module('screens.default', [
        'ui.bootstrap',
        'ui.bootstrap.tabs',
        'ui.bootstrap.tpls',
        'ui.router',
        "monospaced.qrcode",
        "app.shared"
    ])

        .constant("_", _)

        .config(function($locationProvider, $urlRouterProvider, $stateProvider) {

            //$locationProvider.hashPrefix('!');

            $stateProvider.state('home', {
                url: '',
                controller: 'ScreensDefaultIndexController',
                templateUrl: '/app/screens/default/index.html'
            });

            $stateProvider.state('"screens.default', {
                url: "/default",
                template: "<ui-view></ui-view>",
                abstract: true
            });

            $stateProvider.state('"screens.default.message', {
                url: "/coucou",
                templateUrl: "/app/screens/default/message.html"
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

            //screensService.screens.push({
            //    name: 'default',
            //    description: 'Default board',
            //});
            console.log($state.current);

            $rootScope.screenName = 'default';
        });
})();