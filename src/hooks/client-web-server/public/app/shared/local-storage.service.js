(function() {
    "use strict";

    class LocalStorage {
        constructor(config) {
            this.config = config;
        }

        setItem(key, value) {
            window.localStorage.setItem(`${this.config.prefix}.${key}`, value);
        }

        setObject(key, value) {
            window.localStorage.setItem(`${this.config.prefix}.${key}`, JSON.stringify(value));
        }

        getItem(key) {
            return window.localStorage.getItem(`${this.config.prefix}.${key}`);
        }

        removeItem(key) {
            window.localStorage.removeItem(`${this.config.prefix}.${key}`);
        }

        getObject(key) {
            let object = window.localStorage.getItem(`${this.config.prefix}.${key}`);
            return object === null ? null : JSON.parse(object);
        }
    }

    angular
        .module("app.shared")
        .provider("localStorage", function() {
            let config = {
                prefix: ""
            };

            this.setConfig = function(newConf) {
                config = Object.assign({}, config, newConf);
            };

            this.$get = function () {
                return new LocalStorage(config);
            };
        });
})();