'use strict';

import { EventEmitter }  from "events";

export class CustomEventEmitter extends EventEmitter {

    constructor(){
        super();
    }

    // emit(event: string | symbol, ...args: any[]): boolean {
    //     super.emit.apply(this, arguments);
    // }
}