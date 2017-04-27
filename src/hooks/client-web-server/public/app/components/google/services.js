(function() {
    'use strict';

    // http://www.sitepoint.com/mastering-your-inbox-with-gmail-javascript-api/
    // https://developers.google.com/+/web/api/javascript#gapiclientsetapikeyapikey
    angular.module('app.buddy.google')

        .service('googleApi', function(screensService, $rootScope, gapi, $window){

            return {

                user: null,

                setUser: function(user){
                    this.user = user;
                },

                // isAuthorized: function(){
                //     if(!this.user){
                //         return Promise.resolve(false);
                //     }
                //
                //     if ($window.sessionStorage["google"] && $window.sessionStorage["google"].token) {
                //         return Promise.resolve(true);
                //     }
                //
                //     return Promise.resolve(false);
                // },

                /**
                 * Call this method to initiate call to google api.
                 * This method does a silent check and automatic authorize based on current user.
                 *
                 * @returns {Promise}
                 */
                authorize: function(immediate){
                    console.log(this.user);
                    if(!this.user){
                        return Promise.reject(new Error('No user registered to service'));
                    }

                    if(immediate === undefined){
                        immediate = true;
                    }

                    var clientId = this.user.config.externalServices.google.auth.clientId;

                    if(!clientId){
                        return Promise.reject(new Error('Google service not configured yet. Please configure in your preference before using it'));
                    }

                    var scopes = 'https://www.googleapis.com/auth/plus.me';

                    return new Promise(function(resolve, reject){

                        // The iframe may not be displayed with immediate:false. I do not why but a bad clientId may create this error
                        // with immediate:true the popup show up anyway
                        var exitOnTimeout = setTimeout(function(){
                            return reject(new Error('The iframe seems to have some trouble being displayed. Please check user configuration'));
                        }, 2000);

                        // initialize google connexion
                        // open a popup to signin or nothing if it's ok
                        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: immediate}, function(response){

                            clearTimeout(exitOnTimeout);

                            // register token in storage
                            $window.localStorage["user_google_token"] = JSON.stringify(gapi.auth.getToken());

                            if(response.err){
                                return reject(new Error('Unable to connect to google'));
                            }

                            return resolve(gapi);
                        });
                    });
                },
                
                gapi: gapi,

                test: function(auth, sharedApiService){

                    // client secret
                    var clientId = '143547074111-r7r5r57apv1vsi9qnvaqmsjkaug4rb2u.apps.googleusercontent.com';
                    var apiKey = 'AIzaSyBXTrkZdwMcqWmZi25IBujNilP5RB7gUe4';
                    var scopes = 'https://www.googleapis.com/auth/plus.me';

                    function handleClientLoad() {
                        //gapi.client.setApiKey(apiKey);
                        window.setTimeout(checkAuth,1);
                    }

                    function checkAuth() {
                        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
                    }

                    //access_token:"ya29.CjHXAu-BuHz0rElBYdfL-nGmXHBRvy-YyIXk0bRoX7W1a3rKuxfqx7QvCseyeMZuXyEL"
                    //client_id:"143547074111-r7r5r57apv1vsi9qnvaqmsjkaug4rb2u.apps.googleusercontent.com"
                    //cookie_policy:undefined
                    //expires_at:"1462301198"
                    //expires_in:"3600"
                    //g-oauth-window:Window
                    //g_user_cookie_policy:undefined
                    //issued_at:"1462297598"
                    //response_type:"token"
                    //scope:"https://www.googleapis.com/auth/plus.me"
                    //state:""
                    //status:Object
                    //token_type:"Bearer"
                    function handleAuthResult(authResult) {
                        console.log('handleAuthResult', authResult);
                        if (authResult && !authResult.error) {
                            sharedApiService.put(`/users/${auth.getUser().getId()}`, {config: {
                                externalServices: {
                                    google: {
                                        accessToken: authResult.access_token,
                                        refreshToken: null
                                    }
                                }
                            }});

                            makeApiCall();
                        } else {

                        }
                    }

                    // Load the API and make an API call.  Display the results on the screen.
                    function makeApiCall() {
                        // Step 4: Load the Google+ API
                        gapi.client.load('plus', 'v1').then(function() {
                            // Step 5: Assemble the API request
                            var request = gapi.client.plus.people.get({
                                'userId': 'me'
                            });
                            // Step 6: Execute the API request
                            request.then(function(resp) {
                                console.log(resp);
                            }, function(reason) {
                                console.log('Error: ' + reason.result.error.message);
                            });
                        });
                    }

                    setTimeout(function(){
                        handleClientLoad();
                    }, 1000);

                    //function loadGmailApi() {
                    //    gapi.client.load('gmail', 'v1', displayInbox);
                    //}
                    //
                    //handleClientLoad();
                    //var request = gapi.client.plus.people.get({
                    //    userId: 'me'
                    //});
                    //
                    //request.execute(function(resp) {
                    //    console.log('ID: ' + resp.id);
                    //    console.log('Display Name: ' + resp.displayName);
                    //    console.log('Image URL: ' + resp.image.url);
                    //    console.log('Profile URL: ' + resp.url);
                    //});

                    //displayInbox();
                }
            };

            function displayInbox() {
                var request = gapi.client.gmail.users.messages.list({
                    'userId': 'me',
                    'labelIds': 'INBOX',
                    'maxResults': 10
                });

                request.execute(function(response) {
                    $.each(response.messages, function() {
                        var messageRequest = gapi.client.gmail.users.messages.get({
                            'userId': 'me',
                            'id': this.id
                        });

                        messageRequest.execute(function(message){
                            console.log(message);
                        });
                    });
                });
            }
        });
})();