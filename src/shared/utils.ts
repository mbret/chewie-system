import HookBoilerplate from "../core/hook-boilerplate";

export function applyDefaultHookModel(userHook) {
    if (!userHook.prototype.onShutdown) {
        userHook.prototype.onShutdown = HookBoilerplate.prototype.onShutdown;
    }
    if (!userHook.prototype.initialize) {
        userHook.prototype.initialize = HookBoilerplate.prototype.initialize;
    }
}