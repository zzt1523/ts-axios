"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dispatchRequest_1 = require("./dispatchRequest");
var interceptormanager_1 = require("./interceptormanager");
var mergeConfig_1 = require("./mergeConfig");
var Axios = /** @class */ (function () {
    function Axios(initConfig) {
        this.defaults = initConfig;
        this.interceptors = {
            request: new interceptormanager_1.default(),
            response: new interceptormanager_1.default()
        };
    }
    Axios.prototype.request = function (url, config) {
        if (typeof url === 'string') {
            if (!config) {
                config = {};
            }
            config.url = url;
        }
        else {
            config = url;
        }
        config = mergeConfig_1.default(this.defaults, config);
        config.method = config.method.toLowerCase();
        console.log(config);
        var chain = [{
                resolved: dispatchRequest_1.default,
                rejected: undefined
            }];
        this.interceptors.request.forEach(function (interceptors) {
            chain.unshift(interceptors);
        });
        this.interceptors.response.forEach(function (interceptors) {
            chain.push(interceptors);
        });
        var promise = Promise.resolve(config);
        while (chain.length) {
            var _a = chain.shift(), resolved = _a.resolved, rejected = _a.rejected;
            promise = promise.then(resolved, rejected);
        }
        return promise;
    };
    Axios.prototype.get = function (url, config) {
        return this._requestMethodWithoutData('get', url, config);
    };
    Axios.prototype.delete = function (url, config) {
        return this._requestMethodWithoutData('delete', url, config);
    };
    Axios.prototype.head = function (url, config) {
        return this._requestMethodWithoutData('head', url, config);
    };
    Axios.prototype.options = function (url, config) {
        return this._requestMethodWithoutData('options', url, config);
    };
    Axios.prototype.post = function (url, data, config) {
        return this._requestMethodWithData('post', url, data, config);
    };
    Axios.prototype.put = function (url, data, config) {
        return this._requestMethodWithData('put', url, data, config);
    };
    Axios.prototype.patch = function (url, data, config) {
        return this._requestMethodWithData('patch', url, data, config);
    };
    Axios.prototype.getUri = function (config) {
        config = mergeConfig_1.default(this.defaults, config);
        return dispatchRequest_1.transformURL(config);
    };
    Axios.prototype._requestMethodWithoutData = function (method, url, config) {
        return this.request(Object.assign(config || {}, {
            method: method,
            url: url
        }));
    };
    Axios.prototype._requestMethodWithData = function (method, url, data, config) {
        return this.request(Object.assign(config || {}, {
            method: method,
            url: url,
            data: data
        }));
    };
    return Axios;
}());
exports.default = Axios;
//# sourceMappingURL=Axios.js.map