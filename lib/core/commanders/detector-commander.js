'use strict';

class Commander{

    constructor(){

    }

    watch(cb1, cb2){

        setTimeout(function(){

            cb1();
            setTimeout(function(){

                cb2();
            }, 5000);

        }, 5000);
    }

}

module.exports = Commander;