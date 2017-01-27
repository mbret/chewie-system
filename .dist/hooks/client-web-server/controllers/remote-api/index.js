'use strict';

const request = require("request");
// let r = request.defaults({
//     strictSSL: false
// });

module.exports = function (router) {

    // router.post('/*', function(req, res){
    //     // let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    //     let fullUrl = req.app.locals.system.config.sharedApiUrl + req.originalUrl.replace("/remote-api", "");
    //     return req.pipe(r.post({ url: fullUrl }), {end: false}).pipe(res);
    // });

    /**
     * Auth to google
     * https://developers.google.com/drive/v3/web/quickstart/nodejs
     */
    // router.all('/*', function(req, res){
    //     console.log("coucuo");
    //     let fullUrl = req.app.locals.system.config.sharedApiUrl + req.originalUrl.replace("/remote-api", "");
    //     // return req.pipe(r[req.method.toLowerCase()](fullUrl)).pipe(res);
    //     req.app.locals.proxy.web(req, res, { target: req.app.locals.system.config.sharedApiUrl });
    // });
};
