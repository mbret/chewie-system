(function(){
    'use strict';

    angular.module('screens.default')

        // check http://stackoverflow.com/questions/33284948/masonry-multiple-image-width
        .controller('ScreensDefaultIndexController', function($scope, _, screensService, apiService, $http, $interval, $location, $state, $sce, $filter){

            $scope.messages = [];
            $scope.messageUrl = $state.href("message", {}, {absolute: true});
            $scope.feeds = [];

            // Get messages
            updateMessages();
            $interval(function() {
                updateMessages();
            }, 5000);

            // get rss flux
            // scotch.io
            $scope.feeds = [];
            $http.get("https://rss2json.com/api.json", {params : {rss_url: "https://scotch.io/rss"}})
                .then(function(data) {
                    var tmp = data.data.items;
                    tmp = tmp.slice(0, 2);
                    tmp = tmp.map(function(feed) {
                        return {
                            website: data.data.feed.title + " (" + data.data.feed.link + ")",
                            title: feed.title,
                            description: $sce.trustAsHtml(feed.description),
                            pubDate: new Date(feed.pubDate),
                            link: feed.link
                        }
                    });
                    $scope.feeds = $scope.feeds.concat(tmp);
                    return Promise.resolve();
                })
                // jvc
                .then(function() {
                    return $http.get("https://rss2json.com/api.json", {params : {rss_url: "http://www.jeuxvideo.com/rss/rss.xml"}}).then(function(data) {
                        var tmp = data.data.items;
                        tmp = tmp.slice(0, 2);
                        tmp = tmp.map(function(feed) {
                            return {
                                website: data.data.feed.title + " (" + data.data.feed.link + ")",
                                title: feed.title,
                                description: $sce.trustAsHtml(feed.description),
                                pubDate: new Date(feed.pubDate),
                                link: feed.link
                            }
                        });
                        $scope.feeds = $scope.feeds.concat(tmp);
                        return Promise.resolve();
                    });
                })
                .then(function() {
                    setTimeout(function(){
                        updateMasonry();
                    }, 1000);
                });

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

            updateMasonry();

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

                        updateMasonry();
                    },
                    error: function(error) {
                        $(id).html('<p>'+error+'</p>');
                        updateMasonry();
                    }
                });
            }

            function updateMessages() {
                $http.get("api/messages").then(function(data){
                    $scope.messages = data.data;
                });
            }

            function updateMasonry() {
                $('.grid').masonry({
                    itemSelector: '.grid-item',
                    columnWidth: 1,
                });
            }
        })

        .controller('ScreensDefaultMessageController', function($scope, $state, _, screensService, apiService, $http, $interval) {

            $scope.message = {};

            $scope.submit = function(form) {
                if(!form.$valid) {
                    alert("Form invalid");
                    return;
                }
                $http.post("api/messages", $scope.message).then(function(data){
                    $scope.message = {};
                });
            };

        });
})();