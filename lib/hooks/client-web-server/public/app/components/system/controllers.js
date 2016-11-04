(function(){
    'use strict';

    angular
        .module('components.system')

        .controller('SystemController', function($scope, $http, toastr, APP_CONFIG, sharedApiService, auth, mySocket, notificationService){
            $scope.logs = [];
            sharedApiService.get('/logs')
                .then(function(data){
                    $scope.logs = data;
                });
        });
})();