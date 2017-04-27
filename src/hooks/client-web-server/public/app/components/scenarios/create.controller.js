(function(){
    'use strict';

    var taskScenarioId = 1;
    var elementId = 1;

    angular
        .module("components.scenarios")

        /**
         * Modal
         * Add a new item (trigger)
         */
        .controller("CreateScenariosNewItemTriggerController", function($scope, $uibModalInstance, _, $uibModal, triggers) {
            $scope.triggers = triggers;

            $scope.select = function(trigger) {
                $uibModalInstance.close(trigger);
            };

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };
        })

        /**
         * Modal
         * Configure a trigger item.
         */
        .controller("CreateScenariosConfigureTriggerController", function($scope, $uibModalInstance, item, trigger) {
            //$scope.schedules = {
            //    days: [
            //        { value: 0, name: 'Monday' },
            //        { value: 1, name: 'Tuesday' },
            //        { value: 2, name: 'Wednesday' },
            //        { value: 3, name: 'Thursday' },
            //        { value: 4, name: 'Friday' },
            //        { value: 5, name: 'Saturday' },
            //        { value: 6, name: 'Sunday' },
            //    ],
            //    dateRangePickerOptions: {
            //        singleDatePicker: true,
            //        timePicker: true,
            //        startDate: new Date(),
            //        locale: {
            //            format: 'YYYY-MM-DD h:mm A'
            //        },
            //        timePicker24Hour: true,
            //    }
            //};
            $scope.trigger = trigger;
            $scope.formData = {
                options: item.options,
                name: item.name,
                //method: item.configuration.method,
                //schedule: {
                //    interval: 10,
                //    date: item.configuration.schedule.date,
                //    subMoment: item.configuration.schedule.subMoment
                //}
            };

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.confirm = function(form) {
                form.$setSubmitted();
                if (form.$valid) {
                    item.options = $scope.formData.options;
                    item.name = ($scope.formData.name !== null && $scope.formData.name.length > 0) ? $scope.formData.name : trigger.name;
                    $uibModalInstance.close(item);
                }
            };

            console.log(trigger, item);
        })

        /**
         * Modal
         * Configure a task item.
         */
        // .controller("CreateScenariosConfigureTaskController", function($scope, $uibModalInstance, item, module) {
        //     $scope.module = module;
        //     $scope.formData = {
        //         options: item.options,
        //     };
        //
        //     console.log(item, module);
        //
        //     $scope.cancel = function() {
        //         $uibModalInstance.dismiss('cancel');
        //     };
        //
        //     $scope.confirm = function(form) {
        //         form.$setSubmitted();
        //         if (form.$valid) {
        //             item.options = $scope.formData.options;
        //             $uibModalInstance.close(item);
        //         }
        //     };
        // })

        /**
         * Modal
         * Choose a task.
         */
        .controller("scenarios.create.ChooseTaskController", function($scope, sharedApiService, _, authenticationService, $uibModalInstance, tasks) {
            $scope.modules = tasks;

            $scope.select = function(module) {
                $uibModalInstance.close(module);
            };

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };
        });
})();