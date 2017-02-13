"use strict";
import {System} from "../system";
import { EventEmitter }  from "events";
import {HookInterface} from "./hook-interface";

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

    onShutdown() {
        return Promise.resolve();
    }
}