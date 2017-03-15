(function(){
    "use strict";

    angular
        .module('components.hooks')

        .controller('HooksConfigController', function($scope, $http, $uibModal, apiService, APP_CONFIG, $log, sharedApiService, $stateParams, notificationService){

            let id = $stateParams.id;
            $scope.hook = null;
            $scope.options = [];
            $scope.name = id;
            $scope.formData = {
                options: {}
            };
            apiService.get("/api/hooks/" + id)
                .then(function(response) {
                    $scope.hook = response.data;

                    // retrieve config of hook
                    return sharedApiService.get("/devices/" + APP_CONFIG.systemId + "/hooks-config/" + id)
                        .then(function(data) {
                            console.log(data);
                        })
                        .catch(function(err) {
                            if (err.status === 404) {
                                // empty config
                            } else {
                                throw err;
                            }
                        });
                })
                .catch(function(err) {
                    console.error(err);
                });


            // tasksService.getModule(id).then(function(data){
            //     $scope.module = data;
            //
            //     // extract options
            //     _.forEach($scope.module.config.options, function(entry){
            //         var option = entry;
            //
            //         // get possible value of this option
            //         if($scope.module.userOptions[option.name]){
            //             option.value = $scope.module.userOptions[option.name];
            //         }
            //
            //         $scope.options.push(option);
            //     });
            // });

            $scope.submit = function() {
                var options = {};

                _.forEach($scope.options, function(option){
                    options[option.name] = option.value;
                });

                var data = {
                    options: options
                };

                tasksService
                    .updateModuleOptions(id, data)
                    .then(function(){
                        notificationService.success('Saved');
                    });
            };
        });
})();