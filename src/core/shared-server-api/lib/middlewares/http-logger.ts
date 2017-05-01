export default function (req, res, next) {
    req.app.locals.server.logger.verbose(`[${req.hostname } (${req.protocol})] "${req.method} ${req.url} ${req.headers['user-agent'] || '(no user-agent)'}"`);
    return next();
}