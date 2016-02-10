'use strict';

var _ = require('lodash');

module.exports = function(server, router){

    var self = server;

    /**
     * Return the status of all external status
     */
    router.get('/users/external-services-status', function(req, res){

        var status = [
            {
                name: 'google',
                status: 'NOT_CONNECTED'
            }
        ];
        res.send(status);
    });

    return router;
};

