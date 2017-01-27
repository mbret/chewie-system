"use strict";

// see https://www.typescriptlang.org/docs/handbook/mixins.html

import {System} from "../system";

export interface SystemModuleInterface {
    system: System;
    logger: any;
}