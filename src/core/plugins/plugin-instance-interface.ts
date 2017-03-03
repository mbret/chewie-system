export interface PluginInstance {
    mount(cb: Function);
    unmount(cb: Function);
}