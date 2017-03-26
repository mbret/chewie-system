import {System} from "../../system";
import {EmailAdapter} from "./email-adapter";
export default class EmailAdapterContainer {
    adapter: EmailAdapterInterface;
    adapterName: String;
    chewie: System;

    constructor(chewie) {
        this.chewie = chewie;
        // default adapter
        this.setAdapter("default", new EmailAdapter(chewie));
    }

    /**
     * Set the adapter instance. the name is used as debug/visual identification for user.
     * @param name
     * @param adapter
     */
    setAdapter(name = "unknown", adapter) {
        this.adapter = adapter;
        this.adapterName = name;
    }

    /**
     * Convenient access
     * @param options
     * @param cb
     */
    send(options, cb) {
        return this.adapter.send(options, cb);
    }
}