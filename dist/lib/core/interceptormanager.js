"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InterceptorManager = /** @class */ (function () {
    function InterceptorManager() {
        this.interceptors = [];
    }
    InterceptorManager.prototype.use = function (resolved, rejected) {
        this.interceptors.push({
            resolved: resolved,
            rejected: rejected
        });
        return this.interceptors.length - 1;
    };
    InterceptorManager.prototype.forEach = function (fn) {
        this.interceptors.forEach(function (interceptors) {
            if (interceptors !== null) {
                fn(interceptors);
            }
        });
    };
    InterceptorManager.prototype.eject = function (id) {
        if (this.interceptors[id]) {
            this.interceptors[id] = null;
        }
    };
    return InterceptorManager;
}());
exports.default = InterceptorManager;
//# sourceMappingURL=interceptormanager.js.map