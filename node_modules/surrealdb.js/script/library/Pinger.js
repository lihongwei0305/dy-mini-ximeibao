"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pinger = void 0;
class Pinger {
    constructor(interval = 30000) {
        Object.defineProperty(this, "pinger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "interval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.interval = interval;
    }
    start(callback) {
        this.pinger = setInterval(callback, this.interval);
    }
    stop() {
        clearInterval(this.pinger);
    }
}
exports.Pinger = Pinger;
//# sourceMappingURL=Pinger.js.map