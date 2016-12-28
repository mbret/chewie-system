"use strict";
import {HookInterface, Hook} from "../../core/hook-interface";

export = class RemoteServerHook extends Hook implements HookInterface, InitializeAbleInterface {
    initialize(){
        let self = this;
        this.system.on("ready", function() {
            self.system.sharedApiService
                .get("/devices/" + self.system.id + "/scenarios", {
                    params: { deviceId: self.system.id }
                })
                .then(function(response) {

                })
                .catch(function(err) {
                    self.logger.error(err);
                });
        });

        return Promise.resolve();
    }
}