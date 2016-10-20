'use strict';
var BaseRepository = (function () {
    function BaseRepository(system) {
        this.system = system;
    }
    BaseRepository.prototype.loadPlugin = function (name) {
        throw new Error('Not implemented');
    };
    return BaseRepository;
}());
module.exports = BaseRepository;
