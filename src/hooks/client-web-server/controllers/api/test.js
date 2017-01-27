'use strict';

module.exports = function (router) {

    router.get("/", function(req, res) {
        res.send('<code><pre>' + JSON.stringify({}) + '</pre></code>');
    })
};
