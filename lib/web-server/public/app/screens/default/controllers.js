(function(){
    'use strict';

    angular.module('screens.default')

        .controller('ScreensDefaultIndexController', function($scope, APP_CONFIG, $state, _, screensService){

            setInterval(function(){
                displayWeather();
            }, 60000); // every minute

            displayWeather();

            function displayWeather(){
                // v3.1.0
                //Docs at http://simpleweatherjs.com
                $.simpleWeather({
                    location: 'Nancy, France',
                    woeid: '',
                    unit: 'c',
                    success: function(weather) {
                        var html = '<h2><i class="icon-'+weather.code+'"></i> '+weather.temp+'&deg;'+weather.units.temp+'</h2>';
                        html += '<ul><li>'+weather.city+', '+weather.region+'</li>';
                        html += '<li class="currently">'+weather.currently+'</li>';
                        html += '<li>'+weather.wind.direction+' '+weather.wind.speed+' '+weather.units.speed+'</li></ul>';

                        $("#weather").html(html);
                    },
                    error: function(error) {
                        $("#weather").html('<p>'+error+'</p>');
                    }
                });
            }
        });
})();