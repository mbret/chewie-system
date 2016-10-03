(function(){
    'use strict';

    angular
        .module('components.system')

        .controller('SystemController', function($scope, $http, toastr, APP_CONFIG, apiService, auth, mySocket, notificationService){
            $scope.logs = [];
            apiService.get('/logs')
                .then(function(data){
                    $scope.logs = data;
                });
        });
})();