(function(){
    "use strict";

    angular
        .module('app.shared')
        .directive('spinnerCubeGrid', function(){
            return {
                restrict: 'E',
                replace: true,
                template: '' +
                '<div>' +
                    '<div class="sk-spinner sk-spinner-cube-grid"> ' +
                        '<div class="sk-cube"></div> ' +
                        '<div class="sk-cube"></div> ' +
                        '<div class="sk-cube"></div> ' +
                        '<div class="sk-cube"></div> ' +
                        '<div class="sk-cube"></div> ' +
                        '<div class="sk-cube"></div> ' +
                        '<div class="sk-cube"></div> ' +
                        '<div class="sk-cube"></div> ' +
                        '<div class="sk-cube"></div> ' +
                    '</div>' +
                '</div>'

            };
        });
})();