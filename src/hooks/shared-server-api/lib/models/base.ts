'use strict';
var _ = require('lodash');

class Base{

    static toJSON(datas){
        var res = [];
        _.forEach(datas, function(data){
            res.push(data.toJSON());
        });
        return res;
    }
}

module.exports = Base;