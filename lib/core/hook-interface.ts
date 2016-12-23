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

    protected system: System;
    protected logger: any;

    protected constructor(system: System) {
        super();
        this.system = system;
        this.logger = this.getLogger();
    }

    getLogger() {
        return this.system.logger.Logger.getLogger('Hook');
    }
}