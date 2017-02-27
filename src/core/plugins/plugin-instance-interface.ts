export interface PluginInstance {
    mount(helper, cb: Function);
    unmount(cb: Function);
}