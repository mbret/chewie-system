(function() {
    "use strict";

    angular.module("chewie").factory("apiSocket", function (socketFactory, APP_CONFIG) {
            return socketFactory({
                ioSocket: window.io.connect(APP_CONFIG.apiUrl)
            });
        })
})();