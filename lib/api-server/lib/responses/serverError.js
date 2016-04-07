'use strict';

module.exports = function(err){
    // console.log(this);
    return this.response.send(err);
};