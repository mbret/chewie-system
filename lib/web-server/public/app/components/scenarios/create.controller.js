(function(){
    'use strict';

    /**
     *
     */
    angular
        .module('components.scenarios')
        .controller('CreateScenariosController', ["$scope", "$uibModal", function($scope, $uibModal){

            $scope.formId = "form-scenario-create";
            $scope.formData = {
                triggers: [{
                    name: "schedule",
                    method: "moment",
                    schedule: {
                        date: new Date(),
                        subMoment: "date"
                    }
                }]
            };
            $scope.schedules = {
                days: [
                    { value: 0, name: 'Monday' },
                    { value: 1, name: 'Tuesday' },
                    { value: 2, name: 'Wednesday' },
                    { value: 3, name: 'Thursday' },
                    { value: 4, name: 'Friday' },
                    { value: 5, name: 'Saturday' },
                    { value: 6, name: 'Sunday' },
                ],
                dateRangePickerOptions: {
                    singleDatePicker: true,
                    timePicker: true,
                    startDate: new Date(),
                    locale: {
                        format: 'MM/DD/YYYY h:mm A'
                    },
                    timePicker24Hour: true,
                    eventHandlers: {
                        'apply.daterangepicker': function(ev, picker){
                            //console.log($scope.form.schedule.date);
                        }
                    }
                }
            };

            $scope.processForm = function(form) {
                console.log("submit");
            };

            $scope.addTrigger = function() {
                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/components/scenarios/templates/new-trigger.modal.html',
                    controller: 'CreateScenariosNewTriggerController',
                    size: "sm",
                });
                modal.result.then(function(trigger) {
                    $scope.formData.triggers.push(trigger);
                });
            };
        }])
        .controller("CreateScenariosNewTriggerController", ["$scope", "$uibModalInstance", function($scope, $uibModalInstance) {
            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.select = function(item) {
                switch (item) {
                    case "schedule":
                        $uibModalInstance.close({
                            name: "schedule",
                            method: "moment"
                        });
                        break;
                }
            };
        }]);
})();