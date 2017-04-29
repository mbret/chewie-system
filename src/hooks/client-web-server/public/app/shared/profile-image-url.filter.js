(function() {
    "use strict";

    /**
     * @param userService
     * @returns {Function}
     */
    function filter(userService, APP_CONFIG) {
        return function(input) {
            // @todo return default if null (chewbacca)
            return userService.getProfileImageUrl(input)
        }
    }


    angular.module("app.shared").filter("profileImageUrl", filter)
})();