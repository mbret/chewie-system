'use strict';

module.exports = function(err){
    return this.response.send(err);
};