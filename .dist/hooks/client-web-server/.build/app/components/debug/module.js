(function() {
    'use strict';

    angular.module('components.debug', [])

        .config(function() {

        })

        .run(function($log) {
            $log.log("coucou");
        })

        .directive("debugBar", function($log, $sessionStorage, $localStorage) {
            return {
                restrict: "E",
                templateUrl: "/app/components/debug/index.html",
                link: function($scope, $element) {
                    let defaults = {
                        autoLoginProfile: false
                    };
                    $scope.debugBar = $localStorage.debugBar = $localStorage.debugBar || defaults;

                    // Buttons actions

                    $scope.ping = function() {
                        alert("pong");
                    };

                    $scope.autoLogin = function() {
                        let profile = prompt("Profile to login automatically?", $scope.debugBar.autoLoginProfile || "");
                        $scope.debugBar.autoLoginProfile = profile || false;
                    }
                }
            }
        })
})();