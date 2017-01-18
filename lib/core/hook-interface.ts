"use strict";
import {System} from "../system";
import { EventEmitter }  from "events";

export interface HookConstructor {
    new(system: System): Hook;
}

export interface HookInterface {
    // initialize(done: Function);
    getLogger();
}

export class Hook extends EventEmitter implements HookInterface {

    public system: System;
    public logger: any;
    protected config: any;

    protected constructor(system: System, config: any) {
        super();
        this.system = system;
        this.logger = this.getLogger();
        this.config = config;
    }

    getLogger() {
        return this.system.logger.getLogger('Hook');
    }
}

export let hookMixin = {
    emit(e) {
        console.log("PAPA SHULTZ", e, super.emit);
        super.emit.apply(this, arguments);
    }
};