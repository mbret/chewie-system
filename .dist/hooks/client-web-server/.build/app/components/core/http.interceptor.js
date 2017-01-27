(function() {
    "use strict";

    angular
        .module('components.core')
        .config(function($httpProvider){
            $httpProvider.interceptors.push(function(notificationService, APP_CONFIG, $log, $q){
                let logger = $log;// @todo bug with angular-logger :X .getInstance('app');
                return {
                    "requestError": function(rejection) {
                        return $q.reject(rejection);
                    },
                    "responseError": function(rejection) {
                        logger.debug("responseError", rejection);
                        if(rejection.status === -1){
                            notificationService.warning('Oups something went wrong!');
                            logger.error('Unable to reach the api. Did you forget to allow the self-signed certificate of the api endpoint ? To do so visit ' + APP_CONFIG.apiUrl + ' and follow instructions given by your browser.');
                        }

                        return $q.reject(rejection);
                    }
                }
            });
        });
})();