class HookPlaceholder {

    constructor(system) {
        this.system = system;
    }

    initialize() {
        this.system.scenarioReader.registerIngredientsInjection(function() {
            return Promise.resolve({
                "hook:placeholder:test": "coucou"
            });
        });
        this.system.scenarioReader.registerIngredientsInjection(function() {
            return Promise.resolve({
                "hook:placeholder:test2": "zbla"
            });
        });
        return Promise.resolve();
    }
}

module.exports = HookPlaceholder;