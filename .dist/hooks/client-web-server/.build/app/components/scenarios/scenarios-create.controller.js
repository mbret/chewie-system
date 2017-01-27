(function(){
    'use strict';

    var taskScenarioId = 1;
    var elementId = 1;

    angular
        .module("components.scenarios")
        .controller("CreateScenariosController", controller);

    function controller($scope, $uibModal, sharedApiService, auth, util, _, notificationService, apiService, APP_CONFIG) {
        $scope.formId = "form-scenario-create";
        // $scope.elements = [];
        // root node
        $scope.formData = {
            name: null,
            description: null,
            nodes: [],
            autoStart: true,
            moduleId: null, // null because of root
            pluginId: null // null because of root
        };
        // let modal = null;

        /**
         * Choose and include a new task reference.
         */
        // $scope.addNewTaskRef = function() {
        //     modal = $uibModal.open({
        //         animation: true,
        //         templateUrl: '/app/components/scenarios/templates/choose-task.modal.html',
        //         controller: 'scenarios.create.ChooseTaskController',
        //     });
        //     modal.result.then(function(moduleId) {
        //         $scope.elements.push({
        //             type: "task",
        //             moduleId: moduleId,
        //             id: elementId++
        //         });
        //     });
        // };

        /**
         * Create a new scenario
         * @param form
         */
        $scope.confirm = function(form) {
            // extra validation
            if ($scope.formData.nodes.length === 0) {
                form.content.$setValidity("required", false);
            } else {
                form.content.$setValidity("required", true);
            }

            if (form.$valid) {
                sharedApiService.post(util.format("/devices/%s/scenarios", APP_CONFIG.systemId), $scope.formData)
                    .then(function() {
                        notificationService.success("Created");
                    })
                    .catch(function(error) {
                        notificationService.error("Error: " + error.data.message);
                    });
            }
        };
    }
})();