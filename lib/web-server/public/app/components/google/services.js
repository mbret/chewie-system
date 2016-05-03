(function() {
    'use strict';

    // http://www.sitepoint.com/mastering-your-inbox-with-gmail-javascript-api/
    // https://developers.google.com/+/web/api/javascript#gapiclientsetapikeyapikey
    angular.module('myBuddy.google')

        .service('googleApi', function(screensService, $rootScope){

            return {

                test: function(auth, util, apiService){

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
                            apiService.put(util.format('/users/%s', auth.getUser().getId()), {config: {
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