(function() {
    'use strict';

    angular
        .module('components.core', ["angular-logger"])
        .service('notificationService', function notificationService(toastr, _){

            return {
                show: show,
                warning: toastr.warning,
                info: toastr.info,
                success: toastr.success,
                error: toastr.error,
                formErrors: formErrors
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