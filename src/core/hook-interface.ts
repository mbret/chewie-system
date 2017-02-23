"use strict";

import {System} from "../system";
import {Hook} from "./hooks";

export interface HookConstructor {
    new(system: System): Hook;
}

export interface HookInterface {
    initialize(): Promise<any>;
    getLogger();
}

// export let hookMixin = {
//     emit(e) {
//         console.log("PAPA SHULTZ", e, super.emit);
//         super.emit.apply(this, arguments);
//     }
// };