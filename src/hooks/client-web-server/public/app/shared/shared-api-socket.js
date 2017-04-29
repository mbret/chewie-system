(function() {
    "use strict";

    angular.module("chewie").factory('sharedApiSocket', function (socketFactory, APP_CONFIG) {
        return socketFactory({
            ioSocket: window.io.connect(APP_CONFIG.sharedApiProxyUrl)
        });
    })
})();