(function() {
    'use strict';

    angular.module('components.photos', [])

    .config(function($stateProvider) {

        $stateProvider

            // route for the about page
            .state('photos', {
                url: '/photos',
                controller: 'PhotosController',
                templateUrl: '/app/components/photos/index.html'
            });
    });
})();