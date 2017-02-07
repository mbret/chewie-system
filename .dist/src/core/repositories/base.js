'use strict';
class BaseRepository {
    constructor(system, logger) {
        this.system = system;
        this.logger = logger;
    }
    loadPlugin(name) {
        throw new Error('Not implemented');
    }
}
module.exports = BaseRepository;
//# sourceMappingURL=base.js.map