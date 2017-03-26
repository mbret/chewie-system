import {System} from "../../system";

/**
 * class EmailAdapter
 * Dummy adapter, does not send email.
 */
export class EmailAdapter implements EmailAdapterInterface {
    chewie: System;

    constructor(chewie) {
        this.chewie = chewie;
    }

    send(options, cb) {
        this.chewie.logger.warn("A new email demand has been created but there is no email adapter set. The email will be ignored and marked as sent. Please install an email adapter.");
        return cb();
    }
}