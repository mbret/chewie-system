"use strict";
import {HookInterface, Hook} from "../../core/hook-interface";

export = class ScenariosHook extends Hook implements HookInterface, InitializeAbleInterface {
    currentProfile: any;

    initialize(){
        let self = this;
        this.system.on("ready", function() {
            self.system.sharedApiService
                .get("/devices/" + self.system.id + "/scenarios", {
                    params: { deviceId: self.system.id }
                })
                .then(function(response) {
                    console.log("ok", response.body);
                })
                .catch(function(err) {
                    self.logger.error(err);
                });
        });

        return Promise.resolve();
    }

    getLogger() {
        return this.system.logger.Logger.getLogger('ScenariosHook');
    }
}