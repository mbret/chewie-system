(function(){
    'use strict';

    angular.module('screens.default')

        // check http://stackoverflow.com/questions/33284948/masonry-multiple-image-width
        .controller('ScreensDefaultIndexController', function($scope, $state, _, screensService, apiService, $http, $interval){

            $scope.messages = [];
            $scope.messageUrl = "https://localhost:3000/screens/default-screen/add-message";

            // Get messages
            updateMessages();
            $interval(function() {
                updateMessages();
            }, 5000);

            //googleApi.authorize()
            //    .then(function(gapi){
            //        // load api g+
            //        gapi.client.load('plus', 'v1').then(function() {
            //            // Step 5: Assemble the API request
            //            var request = gapi.client.plus.people.get({
            //                'userId': 'me'
            //            });
            //            // Step 6: Execute the API request
            //            request.then(function(resp) {
            //                console.log(resp);
            //            }, function(reason) {
            //                console.log('Error: ' + reason.result.error.message);
            //            });
            //        });
            //
            //        //console.log(gapi.auth.getToken());
            //    })
            //    .catch(function(err){
            //        //notificationService.warning('You need to authorize this app with google');
            //        console.error('You need to authorize this app with google');
            //    });

            // fetch external status
            //apiService.get('/users/' + auth.getUser().getId() + '/external-services').then(function(res){
            //
            //});

            setInterval(function(){
                displayWeather('#weather1', 'Nancy, France');
                displayWeather('#weather2', 'Toul, France');
            }, 60000); // every minute

            displayWeather('#weather1', 'Nancy, France');
            displayWeather('#weather2', 'Toul, France');

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

            //$scope.testApi = function(){
            //    apiService.get('/users/' + auth.getUser().getId() + '/external-services').then(function(res){
            //
            //    });
            //};

            function updateMessages() {
                $http.get("/screens/default-screen/messages").then(function(data){
                    $scope.messages = data.data;
                });
            }

        });
})();