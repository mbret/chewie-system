"use strict";

angular.module('app.shared')

    .factory('alerts', function ( $rootScope, SweetAlert ) {
        let swal = window.swal;
        return {
            confirm: function(title, text) {
                return new Promise(function(resolve) {
                     swal({
                         title: title || "Are you sure?",
                         text: text,
                         type: "warning",
                         showCancelButton: true,
                         confirmButtonColor: "#DD6B55",
                         confirmButtonText: "Yes, I'm sure!",
                         cancelButtonText: "No, cancel!",
                         closeOnConfirm: false,
                         closeOnCancel: false
                     }, function(confirm) {
                         swal.close();
                         return resolve(confirm);
                     });
                });
            }
        }
    });