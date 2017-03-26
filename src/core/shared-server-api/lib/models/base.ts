let _ = require('lodash');

export default class Base {

    static toJSON(datas){
        let res = [];
        _.forEach(datas, function(data){
            res.push(data.toJSON());
        });
        return res;
    }
}