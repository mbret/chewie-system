(function(window, angular){
    'use strict';

    let module = angular.module('chewie');

    function configTranslate($translateProvider) {
        $translateProvider.preferredLanguage('fr');
    }

    function configSharedApi(sharedApiServiceProvider, APP_CONFIG) {
        sharedApiServiceProvider.setApiUri(APP_CONFIG.sharedApiProxyUrl);
    }

    /**
     * https://github.com/better-js-logging/angular-logger
     */
    function configLog(logEnhancerProvider) {
        logEnhancerProvider.datetimePattern = 'dddd h:mm:ss a';
        logEnhancerProvider.logLevels = {
            '*': logEnhancerProvider.LEVEL.DEBUG
        };
    }

    function configToastr(toastrConfig) {
        angular.extend(toastrConfig, {
            autoDismiss: true,
            timeOut: 10000,
        });
    }

    function configMisc($qProvider, localStorageProvider) {
        // @todo patch solution for bug with angular 1.6 and ui router
        $qProvider.errorOnUnhandledRejections(false);
        localStorageProvider.setConfig({
           prefix: "chewie"
        });
    }

    function configAuth(OAuthProvider, authenticationServiceProvider, _, jwtOptionsProvider, $httpProvider) {
        OAuthProvider.configure({
            baseUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            clientId: 'CLIENT_ID',
            clientSecret: 'CLIENT_SECRET' // optional
        });

        function User(data){
            this.id = data.id;
            this.update(data);

            this.getProfileImage = function(size){
                return "resources/img/" + 'profile_default_' + size + '.gif';
            };

            this.getId = function(){
                return this.id;
            };
        }

        /**
         * Update current object with new data
         */
        User.prototype.update = function(data) {
            this.config = data.config;
            this.createdAt = data.createdAt;
            this.firstName = data.firstName;
            this.lastName = data.lastName;
            this.role = data.role;
            this.updatedAt = data.updatedAt;
            this.username = data.username;
        };

        authenticationServiceProvider.setUserModel(User);

        // Please note we're annotating the function so that the $injector works when the file is minified
        jwtOptionsProvider.config({
            whiteListedDomains: ["localhost"],
            authPrefix: 'Bearer ',
            // @ngInject
            tokenGetter: function(options, localStorage) {
                // Skip authentication for any requests ending in .html
                if (options && options.url.substr(options.url.length - 5) === '.html') {
                    return null;
                }
                console.info("retrieve token");
                return localStorage.getItem('token');
            }
        });

        $httpProvider.interceptors.push('jwtInterceptor');
    }

    module
        .constant('annyang', window.annyang)
        .constant('_', _)
        .constant('APP_CONFIG', _.merge(window.SERVER_CONFIG, {
            copyrightDates: '2015-2016',
            systemName: 'My Buddy',
            viewBaseUrl: 'app/views',
            apiUrl: location.protocol + "//" + location.host,
            sharedApiProxyUrl: location.protocol + "//" + location.hostname + ":3002"
        }))
        .constant('TASK_TYPE', {
            schedule: 'ScheduledTask',
            trigger: 'TriggeredTask'
        })
        .config(configMisc)
        .config(configAuth)
        .config(configToastr)
        .config(configLog)
        .config(configSharedApi)
        .config(configTranslate);

})(window, window.angular);