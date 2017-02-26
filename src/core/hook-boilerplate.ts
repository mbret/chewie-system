"use strict";

export default class HookBoilerplate {
    initialize() { return Promise.resolve() }
    onShutdown() { return Promise.resolve() }
}