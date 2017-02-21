const EventEmitter = require("events");
let router = require('express').Router();
let passport = require('passport');
let FacebookStrategy = require('passport-facebook').Strategy;
let FB = require('fb');
let debug = require('debug');

/**
 * class AuthServiceTokenGenerator
 *
 * docs:
 * https://github.com/node-facebook/facebook-node-sdk
 * https://developers.facebook.com/docs/facebook-login/access-tokens/expiration-and-extension
 */
class AuthServiceTokenGenerator extends EventEmitter {

    constructor(system, config) {
        super();
        let self = this;
        this.system = system;
        this.logger = this.system.logger.getLogger('hooks:auth-services-token-generator');

        // @todo
        debug("chewie:hooks:auth-services-token-generator")("coucou");

        // https://localhost:3002/hooks/auth-services-token-generator/auth/facebook/callback
        passport.use(new FacebookStrategy({
                clientID: "105360643322915",
                clientSecret: "8bc30ee85e377983e29062b2b45add99",
                callbackURL: "https://localhost:3002/hooks/auth-services-token-generator/auth/facebook/callback"
            },
            function(accessToken, refreshToken, profile, done) {
                // console.log(accessToken, refreshToken, profile);
                return done(null, {
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    profile: profile,
                });
            }
        ));

        // Redirect the user to Facebook for authentication.  When complete,
        // Facebook will redirect the user back to the application at
        //     /auth/facebook/callback
        router.get('/auth/facebook', passport.authenticate('facebook'));

        // Facebook will redirect the user to this URL after approval.  Finish the
        // authentication process by attempting to obtain an access token.  If
        // access was granted, the user will be logged in.  Otherwise,
        // authentication has failed.
        router.get('/auth/facebook/callback', function(req, res, next) {
            passport.authenticate('facebook', {session:false}, function(err, data, info) {
                if (err) {
                    return res.serverError(err);
                }
                FB.setAccessToken(data.accessToken);
                FB.api('oauth/access_token', {
                    client_id: '105360643322915',
                    client_secret: '8bc30ee85e377983e29062b2b45add99',
                    grant_type:"fb_exchange_token",
                    fb_exchange_token: FB.getAccessToken()
                }, function (response) {
                    if(!response || response.error) {
                        console.log(!response ? 'error occurred' : response.error);
                        return res.serverError(response.error);
                    }

                    return res.ok({
                        longLivingToken: response,
                        data: data,
                        info: info
                    });
                });

            })(req, res, next);
        });

        router.get("/foo", function(req, res) {
            self.foo();
            return res.ok();
        })
    }

    initialize() {
        let self = this;
        this.system.on("hook:shared-server-api:initialized", function() {
            let sharedServerApi = self.system.hooks["shared-server-api"];
            sharedServerApi.app.use('/hooks/auth-services-token-generator', passport.initialize());
            sharedServerApi.app.use('/hooks/auth-services-token-generator', router);
        });

        this.system.on("ready", function() {
            self.logger.info("The direct routes to retrieve access token are:" +
                "\nFacebook: https://localhost:3002/hooks/auth-services-token-generator/auth/facebook" +
                "\nGoogle: https://localhost:3002/hooks/auth-services-token-generator/auth/google");
        });

        return Promise.resolve();
    }

    onShutdown() {
        return Promise.resolve();
    }

    foo() {
        FB.setAccessToken('EAABf0yZB39CMBALQhcZACUi29Q700vFRrIHIgbrWAT2IHnxQDyybf9ZCzW8BTlt3La0JnPeJCRK9B8pVvC992E3JNY3ZA4WyKQDim9wBR2b9aOk7FVHR4ggHr68FomAYtzKTb06yjScxXtFneua0pAd7STuR8ZCQ90fiP2pK4SeKaP0awp1Hj');
        FB.api('me', function (res) {
            if(!res || res.error) {
                console.log(!res ? 'error occurred' : res.error);
                return;
            }
            console.log(res.id);
            console.log(res.name);
        });
        FB.api('oauth/access_token', {
            client_id: '105360643322915',
            client_secret: '8bc30ee85e377983e29062b2b45add99',
            grant_type:"fb_exchange_token",
            fb_exchange_token:FB.getAccessToken()
        }, function (res) {
            if(!res || res.error) {
                console.log(!res ? 'error occurred' : res.error);
                return;
            }

            console.log(res);
        });
    }
}

module.exports = AuthServiceTokenGenerator;