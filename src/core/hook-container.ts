import {Hook} from "./hook";

/**
 *
 */
export class HookContainer {
    hook: Hook;
    type: string;
    name: string;
    version: string;

    constructor(hook, { type, version, name }) {
        this.hook = hook;
        this.type = type;
        this.version = version;
        this.name = name;
    }
}