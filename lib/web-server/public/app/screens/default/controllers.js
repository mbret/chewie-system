(function(){
    'use strict';

    angular.module('screens.default')

        .controller('ScreensDefaultIndexController', function($scope, APP_CONFIG, $state, _, screensService, notificationService, googleApi, apiService, util, auth, OAuth){

            // fetch external status
            apiService.get(util.format('/users/%s/external-services', auth.getUser().getId())).then(function(res){

            });

            setInterval(function(){
                //displayWeather('#weather1', 'Nancy, France');
                //displayWeather('#weather2', 'Toul, France');
            }, 60000); // every minute

            //displayWeather('#weather1', 'Nancy, France');
            //displayWeather('#weather2', 'Toul, France');

            // Retrieve google user data
            // Extract google connection information
            apiService.get(util.format('/users/%s', auth.getUser().getId()))
                .then(function(user){

                    var clientId = user.config.externalServices.google.auth.clientId;

                    if(!clientId){
                        notificationService.warning('Google service not configured yet');
                        return;
                    }

                    var scopes = 'https://www.googleapis.com/auth/plus.me';

                    // initialize google connexion
                    // open a popup to signin or nothing if it's ok
                    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, function(response){
                        if(!response.error){

                            // load api g+
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
                    });
                });

            function displayWeather(id, location){
                // v3.1.0
                //Docs at http://simpleweatherjs.com
                $.simpleWeather({
                    location: location,
                    woeid: '',
                    unit: 'c',
                    success: function(weather) {
                        var html = '<h2><i class="icon-'+weather.code+'"></i> '+weather.temp+'&deg;'+weather.units.temp+'</h2>';
                        html += '<ul><li>'+weather.city+', '+weather.region+'</li>';
                        html += '<li class="currently">'+weather.currently+'</li>';
                        html += '<li>'+weather.wind.direction+' '+weather.wind.speed+' '+weather.units.speed+'</li></ul>';

                        $(id).html(html);
                    },
                    error: function(error) {
                        $(id).html('<p>'+error+'</p>');
                    }
                });
            }

            $scope.testApi = function(){
                apiService.get(util.format('/users/%s/external-services', auth.getUser().getId())).then(function(res){

                });
            };

            $scope.testApi
        });
})();