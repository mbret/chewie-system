"use strict";
import {System} from "../system";

export interface HookConstructor {
    new(system: System): Hook;
}

export interface HookInterface {
    initialize(done: Function);
}