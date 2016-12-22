(function() {
    'use strict';

    angular.module('components.core', [])

        .config(function($httpProvider, $provide, $injector){
            $provide.factory('myHttpInterceptor', function(notificationService, APP_CONFIG, $log){
                let logger = $log.getInstance('app');
                return {
                    "requestError": function(rejection) {
                        //console.log(rejection);
                    },
                    "responseError": function(rejection) {
                        logger.debug("responseError", rejection);
                        if(rejection.status === -1){
                            notificationService.warning('Oups something went wrong!');
                            logger.error('Unable to reach the api. Did you forget to allow the self-signed certificate of the api endpoint ? To do so visit ' + APP_CONFIG.apiUrl + ' and follow instructions given by your browser.');
                        }
                        return Promise.reject(rejection);
                    }
                }
            });
            $httpProvider.interceptors.push('myHttpInterceptor');
        })

        .service('notificationService', function notificationService(toastr, _){

            return {
                show: show,
                warning: toastr.warning,
                info: toastr.info,
                success: toastr.success,
                error: toastr.error,
                formErrors: formErrors,
            };

            function formErrors(form){
                let message = 'Your form has some errors:';
                _.forEach(form.$error, function(errors, key){
                    _.forEach(errors, function(field){
                        message += '<b>' + key + ': ' + field.$name;
                    });
                    console.log(error, key);
                });
            }

            function show(type, content) {
                switch(type){
                    case 'error':
                        this.error(content);
                        break;
                    case 'warning':
                        this.warning(content);
                        break;
                    case 'success':
                        this.success(content);
                        break;
                    default:
                        this.info(content);
                }
            }
        })
})();