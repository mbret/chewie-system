'use strict';
var BaseRepository = (function () {
    function BaseRepository(system, logger) {
        this.system = system;
        this.logger = logger;
    }
    BaseRepository.prototype.loadPlugin = function (name) {
        throw new Error('Not implemented');
    };
    return BaseRepository;
}());
module.exports = BaseRepository;
