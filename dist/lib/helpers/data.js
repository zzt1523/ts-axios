"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
function transformRequest(data) {
    if (util_1.isPlainObject(data)) {
        return JSON.stringify(data);
    }
    return data;
}
exports.transformRequest = transformRequest;
function transformResoponse(data) {
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        }
        catch (error) {
            // do nothing
        }
    }
    return data;
}
exports.transformResoponse = transformResoponse;
//# sourceMappingURL=data.js.map