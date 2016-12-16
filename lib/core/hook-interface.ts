"use strict";
import {Daemon} from "../daemon";

export interface HookConstructor {
    new(system: Daemon): Hook;
}

export interface HookInterface {
    initialize(done: Function);
}