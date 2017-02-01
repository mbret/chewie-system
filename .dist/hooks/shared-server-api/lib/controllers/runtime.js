'use strict';
var util = require('util');
module.exports = function (server, router) {
    var UserDao = server.orm.models.User;
    var TaskDao = server.orm.models.Task;
    router.all("/runtime/tasks*", function (req, res, next) {
        if (req.method === "OPTIONS" || server.system.runtime.hasActiveProfile()) {
            return next();
        }
        return res.badRequest({ code: "noActiveProfile" });
    });
    router.post("/runtime/tasks/:task", function (req, res) {
        var id = parseInt(req.params.task);
        TaskDao.findById(id)
            .then(function (task) {
            if (!task) {
                return res.notFound();
            }
            server.system.runtime.executeTask(task);
            return res.created();
        })
            .catch(res.serverError);
    });
    router.delete("/runtime/executing-tasks/:execution", function (req, res) {
        var id = req.params.execution;
        var executingTask = server.system.runtime.executingTasks.get(id);
        if (!executingTask) {
            return res.notFound();
        }
        server.system.runtime.stopTask(executingTask);
        return res.ok();
    });
};
//# sourceMappingURL=runtime.js.map