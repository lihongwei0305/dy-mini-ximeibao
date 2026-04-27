import { AnyAuth } from "../types.js";
export declare function processAuthVars<T extends AnyAuth>(vars: T, fallback?: {
    namespace?: string;
    database?: string;
}): T;
