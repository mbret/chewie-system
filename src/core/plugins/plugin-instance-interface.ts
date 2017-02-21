export interface PluginInstance {
    mount(helper, cb: Function);
    unMount(cb: Function);
}