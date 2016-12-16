"use strict";

// see https://www.typescriptlang.org/docs/handbook/mixins.html

import {Daemon} from "../daemon";

export interface SystemModuleInterface {
    system: Daemon;
    logger: any;
}