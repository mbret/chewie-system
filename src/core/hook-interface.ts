"use strict";
import {System} from "../system";
import { EventEmitter }  from "events";
import {Hook} from "./hooks";

export interface HookConstructor {
    new(system: System): Hook;
}

export interface HookInterface {
    // initialize(done: Function);
    getLogger();
}

export let hookMixin = {
    emit(e) {
        console.log("PAPA SHULTZ", e, super.emit);
        super.emit.apply(this, arguments);
    }
};