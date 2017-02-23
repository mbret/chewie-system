module.exports = function(hook, router) {

    /**
     * Web App entry point
     */
    router.get("/", function(req, res) {
        return res.sendFile(__dirname + "/index.html");
    });

    /**
     *
     */
    router.get("/configuration.js", function(req, res) {
        let config = {
            facebook: {
                appId: hook.config.facebook.appId
            }
        };
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', 0);
        res.send('window.CONFIG = ' + JSON.stringify(config) + ';');
    });

    /**
     *
     */
    router.post("/auth/facebook", function(req, res) {
        let name = req.body.name;
        let accessToken = req.body.accessToken;
        let appSecret = req.body.appSecret;

        if (!name) return res.badRequest("name");
        if (!accessToken) return res.badRequest("accessToken");
        if (!appSecret) return res.badRequest("appSecret");

        // verify if already exist
        hook.helper.getStorage(STORAGE_KEY_FACEBOOK)
            .then(function(storageData) {
                if (storageData[name]) {
                    return res.badRequest({code: "alreadyExist"});
                }

                return hook._retrieveFacebookLongLivingToken(accessToken, appSecret)
                    .then(function(response) {
                        // update current storage data
                        storageData[name] = {
                            accessToken: response.access_token,
                            appSecret: appSecret
                        };
                        hook.helper
                            .setStorage(STORAGE_KEY_FACEBOOK, storageData, {partial: true})
                            .then(function() {
                                hook._watchFacebookToken(name);
                                return res.created(storageData[name]);
                            })
                            .catch(res.serverError);
                    });
            })
            .catch(res.serverError);
    });
};