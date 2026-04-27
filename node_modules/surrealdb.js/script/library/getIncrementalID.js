"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIncrementalID = void 0;
let id = 0;
function getIncrementalID() {
    return (id = (id + 1) % Number.MAX_SAFE_INTEGER).toString();
}
exports.getIncrementalID = getIncrementalID;
//# sourceMappingURL=getIncrementalID.js.map