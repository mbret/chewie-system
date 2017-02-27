"use strict";

import {System} from "../system";
import { EventEmitter }  from "events";
import {HookInterface} from "./hook-interface";

export abstract class Hook extends EventEmitter implements HookInterface {

    public system: System;
    public logger: any;
    protected config: any;

    public constructor(system: System, config: any) {
        super();
        this.system = system;
        this.logger = this.getLogger();
        this.config = config;
    }

    getLogger() {
        return this.system.logger.getLogger('Hook');
    }

    initialize() {
        return Promise.resolve();
    }

    onShutdown() {
        return Promise.resolve();
    }
}