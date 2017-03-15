import {Hook} from "./hook";
/**
 *
 */
export class HookContainer {
    hook: Hook;
    packageInfo: any;

    constructor(hook, packageInfo) {
        this.hook = hook;
        this.packageInfo = packageInfo;
    }
}