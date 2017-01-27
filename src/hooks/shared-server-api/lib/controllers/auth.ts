'use strict';

var _ = require('lodash');
var jwt = require('jsonwebtoken');
var validator = require("validator");

module.exports = function(server, router){

    var userService = server.services.usersService;
    var UserDao = server.orm.models.User;

    router.post('/auth/signin', function(req, res){

        let username = req.body.login;
        let search = {};

        if(!username || !validator.isUsername(username)) {
            return res.badRequest("bad credentials");
        }

        search.username = username;

        UserDao
            .findOne({where: search})
            .then(function(user){
                if(!user){
                    return res.badRequest("bad credentials");
                }
                var token = jwt.sign({ id: user.id }, server.system.config.auth.jwtSecret);
                return res.json({
                    data: userService.formatUser(user.toJSON()),
                    token: token
                });
            })
            .catch(res.serverError);
    });

    router.get('/auth/signout', function(req, res){
        server.userAuthentication.logout(function(err){
            if(err){
                return res.status(500).send(err.stack);
            }

            return res.status(200).send();
        });
    });
};

//"SequelizeValidationError: {"config":{"externalServices":{"google":{"auth":{"clientId":null,"clientSecret":null},"accessToken":null,"refreshToken":null}},"foo":"bar","screens":[{"id":"e9a57752-a683-4889-960e-92fbd3c26d88","name":"Default","description":"This is your first screen"}]}} is not a valid string
//at STRING.validate (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\lib\data-types.js:132:11)
//at Object.QueryGenerator.escape (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\lib\dialects\abstract\query-generator.js:958:26)
//at Object.QueryGenerator.whereItemQuery (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\lib\dialects\abstract\query-generator.js:2260:22)
//at C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\lib\dialects\abstract\query-generator.js:2155:28
//at C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\node_modules\lodash\lodash.js:4389:15
//at baseForOwn (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\node_modules\lodash\lodash.js:2652:24)
//at Function.forOwn (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\node_modules\lodash\lodash.js:12254:24)
//at C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\lib\dialects\abstract\query-generator.js:2152:11
//at Object.QueryGenerator.whereItemQuery (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\lib\dialects\abstract\query-generator.js:2159:9)
//at C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\lib\dialects\abstract\query-generator.js:1891:25
//at C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\node_modules\lodash\lodash.js:4389:15
//at baseForOwn (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\node_modules\lodash\lodash.js:2652:24)
//at Function.forOwn (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\node_modules\lodash\lodash.js:12254:24)
//at Object.QueryGenerator.whereItemsQuery (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\lib\dialects\abstract\query-generator.js:1890:9)
//at Object.QueryGenerator.getWhereConditions (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\lib\dialects\abstract\query-generator.js:2325:19)
//at Object.QueryGenerator.selectQuery (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\lib\dialects\abstract\query-generator.js:1451:28)
//at QueryInterface.select (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\lib\query-interface.js:669:25)
//at .<anonymous> (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\lib\model.js:1390:32)
//at tryCatcher (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\node_modules\bluebird\js\release\util.js:16:23)
//at Promise._settlePromiseFromHandler (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\node_modules\bluebird\js\release\promise.js:502:31)
//at Promise._settlePromise (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\node_modules\bluebird\js\release\promise.js:559:18)
//at Promise._settlePromise0 (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\node_modules\bluebird\js\release\promise.js:604:10)
//at Promise._settlePromises (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\node_modules\bluebird\js\release\promise.js:683:18)
//at Async._drainQueue (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\node_modules\bluebird\js\release\async.js:138:16)
//at Async._drainQueues (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\node_modules\bluebird\js\release\async.js:148:10)
//at Immediate.Async.drainQueues [as _onImmediate] (C:\Users\mbret\Workspace\my-buddy\my-buddy-system\node_modules\sequelize\node_modules\bluebird\js\release\async.js:17:14)
//at tryOnImmediate (timers.js:543:15)
//at processImmediate [as _immediateCallback] (timers.js:523:5)"