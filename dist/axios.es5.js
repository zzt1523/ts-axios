var toString = Object.prototype.toString;
function isDate(val) {
    return toString.call(val) === '[object Date]';
}
// export function isObject(val: any): val is Object {
//     return val !== null && typeof val === 'object'
// }
function isPlainObject(val) {
    return toString.call(val) === '[object Object]';
}
function isFormData(val) {
    return typeof val !== 'undefined' && val instanceof FormData;
}
function isURLSearchParams(val) {
    return typeof val !== 'undefined' && val instanceof URLSearchParams;
}
function extend(to, from) {
    for (var key in from) {
        to[key] = from[key];
    }
    return to;
}
function deepMerge() {
    var objs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        objs[_i] = arguments[_i];
    }
    var result = Object.create(null);
    objs.forEach(function (obj) {
        if (obj) {
            Object.keys(obj).forEach(function (key) {
                var val = obj[key];
                if (isPlainObject(val)) {
                    if (isPlainObject(result[key])) {
                        result[key] = deepMerge(result[key], val);
                    }
                    else {
                        result[key] = deepMerge(val);
                    }
                }
                else {
                    result[key] = val;
                }
            });
        }
    });
    return result;
}

function normalizeHeaderName(headers, normalizedName) {
    if (!headers) {
        return;
    }
    Object.keys(headers).forEach(function (name) {
        if (name !== normalizedName &&
            name.toUpperCase() === normalizedName.toUpperCase()) {
            headers[normalizedName] = headers[name];
            delete headers[name];
        }
    });
}
function processHeaders(headers, data) {
    normalizeHeaderName(headers, 'Content-Type');
    if (isPlainObject(data)) {
        if (headers && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json;charset=utf-8';
        }
    }
    return headers;
}
function parseHeaders(headers) {
    var parsed = Object.create(null);
    if (!headers) {
        return parsed;
    }
    headers.split('\r\n').forEach(function (line) {
        var _a = line.split(':'), key = _a[0], vals = _a.slice(1);
        key = key.trim().toLowerCase();
        if (!key) {
            return;
        }
        var val = vals.join(':').trim();
        parsed[key] = val;
    });
    return parsed;
}
function flattenHeaders(headers, method) {
    if (!headers) {
        return headers;
    }
    headers = deepMerge(headers.common, headers[method], headers);
    var methodsToDelete = [
        'delete',
        'get',
        'head',
        'options',
        'post',
        'put',
        'patch',
        'common'
    ];
    methodsToDelete.forEach(function (method) {
        delete headers[method];
    });
    return headers;
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var AxiosError = /** @class */ (function (_super) {
    __extends(AxiosError, _super);
    /* istanbul ignore next */
    function AxiosError(message, config, code, request, response) {
        var _this = _super.call(this, message) || this;
        _this.config = config;
        _this.code = code;
        _this.request = request;
        _this.response = response;
        _this.isAxiosError = true;
        Object.setPrototypeOf(_this, AxiosError.prototype);
        return _this;
    }
    return AxiosError;
}(Error));
function createError(message, config, code, request, response) {
    var error = new AxiosError(message, config, code, request, response);
    return error;
}

function encode(val) {
    return encodeURIComponent(val)
        .replace(/%40/g, '@')
        .replace(/%3A/gi, ':')
        .replace(/%24/g, '$')
        .replace(/%2C/gi, ',')
        .replace(/%20/g, '+')
        .replace(/%5B/gi, '[')
        .replace(/%5D/gi, ']');
}
function buildURL(url, params, paramsSerializer) {
    if (!params) {
        return url;
    }
    var serializedParams;
    if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
    }
    else if (isURLSearchParams(params)) {
        serializedParams = params.toString();
    }
    else {
        var parts_1 = [];
        Object.keys(params).forEach(function (key) {
            var val = params[key];
            if (val === null || typeof val === 'undefined') {
                return;
            }
            var values = [];
            if (Array.isArray(val)) {
                values = val;
                key += '[]';
            }
            else {
                values = [val];
            }
            values.forEach(function (val) {
                if (isDate(val)) {
                    val = val.toISOString();
                }
                else if (isPlainObject(val)) {
                    val = JSON.stringify(val);
                }
                parts_1.push(encode(key) + "=" + encode(val));
            });
        });
        serializedParams = parts_1.join('&');
    }
    if (serializedParams) {
        var markIndex = url.indexOf('#');
        if (markIndex !== -1) {
            url = url.slice(0, markIndex);
        }
        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }
    return url;
}
function isAbsoluteURL(url) {
    return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
}
function combineURL(baseURL, relativeURL) {
    return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
}
function isURLSameOrigin(reuqestURL) {
    var parsedOrigin = resolveURL(reuqestURL);
    return (parsedOrigin.protocol === currentOrigin.protocol &&
        parsedOrigin.host === currentOrigin.host);
}
var urlParsingNode = document.createElement('a');
var currentOrigin = resolveURL(window.location.href);
function resolveURL(url) {
    urlParsingNode.setAttribute('href', url);
    var protocol = urlParsingNode.protocol, host = urlParsingNode.host;
    return {
        protocol: protocol,
        host: host
    };
}

var cookie = {
    read: function (name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return match ? decodeURIComponent(match[3]) : null;
    }
};

function xhr(config) {
    return new Promise(function (resolve, reject) {
        var _a = config.data, data = _a === void 0 ? null : _a, url = config.url, method = config.method, _b = config.headers, headers = _b === void 0 ? {} : _b, responseType = config.responseType, timeout = config.timeout, cancelToken = config.cancelToken, withCredentials = config.withCredentials, xsrfCookieName = config.xsrfCookieName, xsrfHeaderName = config.xsrfHeaderName, onDownloadProgress = config.onDownloadProgress, onUploadProgress = config.onUploadProgress, auth = config.auth, validateStatus = config.validateStatus;
        var request = new XMLHttpRequest();
        request.open(method.toLocaleUpperCase(), url, true);
        ConfigureRequest();
        addEvents();
        processHeaders$$1();
        processCancel();
        request.send(data);
        function ConfigureRequest() {
            if (responseType) {
                request.responseType = responseType;
            }
            if (timeout) {
                request.timeout = timeout;
            }
            if (withCredentials) {
                request.withCredentials = withCredentials;
            }
        }
        function addEvents() {
            request.onreadystatechange = function handleLoad() {
                if (request.readyState !== 4) {
                    return;
                }
                if (request.status === 0) {
                    return;
                }
                var responseHeader = parseHeaders(request.getAllResponseHeaders());
                var responseData = responseType && responseType !== 'text'
                    ? request.response
                    : request.responseText;
                var response = {
                    data: responseData,
                    status: request.status,
                    statusText: request.statusText,
                    headers: responseHeader,
                    config: config,
                    request: request
                };
                handleResponse(response);
            };
            request.onerror = function handleError() {
                reject(createError('Network Error', config, null, request));
            };
            request.ontimeout = function handleTimeout() {
                reject(createError("Timeout of " + timeout + " ms exceeded", config, 'ECONNABORTED', request));
            };
            if (onDownloadProgress) {
                request.onprogress = onDownloadProgress;
            }
            if (onUploadProgress) {
                request.upload.onprogress = onUploadProgress;
            }
        }
        function processHeaders$$1() {
            if (isFormData(data)) {
                delete headers['Content-Type'];
            }
            if ((withCredentials || isURLSameOrigin(url)) && xsrfCookieName) {
                var xsrfValue = cookie.read(xsrfCookieName);
                if (xsrfValue && xsrfHeaderName) {
                    headers[xsrfHeaderName] = xsrfValue;
                }
            }
            if (auth) {
                headers['Authorization'] =
                    'Basic ' + btoa(auth.username + ':' + auth.password);
            }
            Object.keys(headers).forEach(function (name) {
                if (data === null && name.toLowerCase() === 'content-type') {
                    delete headers[name];
                }
                else {
                    request.setRequestHeader(name, headers[name]);
                }
            });
        }
        function processCancel() {
            if (cancelToken) {
                cancelToken.promise
                    .then(function (reason) {
                    request.abort();
                    reject(reason);
                })
                    .catch(
                /* istanbul ignore next */
                function () {
                    // do nothing
                });
            }
        }
        function handleResponse(response) {
            if (!validateStatus || validateStatus(response.status)) {
                resolve(response);
            }
            else {
                reject(createError("Request failed with status code " + response.status, config, null, request, response));
            }
        }
    });
}

function transform(data, headers, fns) {
    if (!fns) {
        return data;
    }
    if (!Array.isArray(fns)) {
        fns = [fns];
    }
    fns.forEach(function (fn) {
        data = fn(data, headers);
    });
    return data;
}

function dispatchRequest(config) {
    throwIfCancellationRequested(config);
    processConfigConfig(config);
    return xhr(config).then(function (res) {
        return transformResponseData(res);
    }, function (e) {
        if (e && e.response) {
            e.response = transformResponseData(e.response);
        }
        return Promise.reject(e);
    });
}
function processConfigConfig(config) {
    config.url = transformURL(config);
    config.data = transform(config.data, config.headers, config.transformRequest);
    config.headers = flattenHeaders(config.headers, config.method);
}
function transformURL(config) {
    var url = config.url, params = config.params, paramsSerializer = config.paramsSerializer, baseURL = config.baseURL;
    if (baseURL && !isAbsoluteURL(url)) {
        url = combineURL(baseURL, url);
    }
    return buildURL(url, params, paramsSerializer);
}
function transformResponseData(res) {
    res.data = transform(res.data, res.headers, res.config.transformResponse);
    return res;
}
function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
    }
}
// export default axios

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

var strats = Object.create(null);
function defaultStart(val1, val2) {
    return typeof val2 !== 'undefined' ? val2 : val1;
}
function fromVal2Strat(val1, val2) {
    if (typeof val2 !== 'undefined') {
        return val2;
    }
}
function deepMergeStrat(val1, val2) {
    if (isPlainObject(val2)) {
        return deepMerge(val1, val2);
    }
    else if (typeof val2 !== 'undefined') {
        return val2;
    }
    else if (isPlainObject(val1)) {
        return deepMerge(val1);
    }
    else {
        return val1;
    }
}
var stratKeysFromVal2 = ['url', 'params', 'data'];
stratKeysFromVal2.forEach(function (key) { return (strats[key] = fromVal2Strat); });
var stratKeysDeepMerge = ['headers', 'auth'];
stratKeysDeepMerge.forEach(function (key) {
    strats[key] = deepMergeStrat;
});
function mergeConfig(config1, config2) {
    if (!config2) {
        config2 = {};
    }
    var config = Object.create(null);
    for (var key in config2) {
        mergeField(key);
    }
    for (var key in config1) {
        if (!config2[key]) {
            mergeField(key);
        }
    }
    function mergeField(key) {
        var strat = strats[key] || defaultStart;
        config[key] = strat(config1[key], config2[key]);
    }
    return config;
}

var Axios = /** @class */ (function () {
    function Axios(initConfig) {
        this.defaults = initConfig;
        this.interceptors = {
            request: new InterceptorManager(),
            response: new InterceptorManager()
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
        config = mergeConfig(this.defaults, config);
        config.method = config.method.toLowerCase();
        console.log(config);
        var chain = [
            {
                resolved: dispatchRequest,
                rejected: undefined
            }
        ];
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
        config = mergeConfig(this.defaults, config);
        return transformURL(config);
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

function transformRequest(data) {
    if (isPlainObject(data)) {
        return JSON.stringify(data);
    }
    return data;
}
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

var defaults = {
    method: 'get',
    timeout: 0,
    headers: {
        common: {
            Accept: 'application/json, text/plain, */*'
        }
    },
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    transformRequest: [
        function (data, headers) {
            processHeaders(headers, data);
            return transformRequest(data);
        }
    ],
    transformResponse: [
        function (data) {
            return transformResoponse(data);
        }
    ],
    validateStatus: function (status) {
        return status >= 200 && status < 300;
    }
};
var methodsNoData = ['delete', 'get', 'head', 'options'];
methodsNoData.forEach(function (method) {
    defaults.headers[method] = {};
});
var methodsWithData = ['post', 'put', 'patch'];
methodsWithData.forEach(function (method) {
    defaults.headers[method] = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };
});

var Cancel = /** @class */ (function () {
    function Cancel(message) {
        this.message = message;
    }
    return Cancel;
}());
function isCancel(value) {
    return value instanceof Cancel;
}

var CancelToken = /** @class */ (function () {
    function CancelToken(executor) {
        var _this = this;
        var resolvePromise;
        this.promise = new Promise(function (resolve) {
            resolvePromise = resolve;
        });
        executor(function (message) {
            if (_this.reason) {
                return;
            }
            _this.reason = new Cancel(message);
            resolvePromise(_this.reason);
        });
    }
    CancelToken.prototype.throwIfRequested = function () {
        if (this.reason) {
            throw this.reason;
        }
    };
    CancelToken.source = function () {
        var cancel;
        var token = new CancelToken(function (c) {
            cancel = c;
        });
        return {
            cancel: cancel,
            token: token
        };
    };
    return CancelToken;
}());

function createInstance(config) {
    var context = new Axios(config);
    var instance = Axios.prototype.request.bind(context);
    extend(instance, context);
    return instance;
}
var axios = createInstance(defaults);
axios.create = function create(config) {
    return createInstance(mergeConfig(defaults, config));
};
axios.CancelToken = CancelToken;
axios.Cancel = Cancel;
axios.isCancel = isCancel;
axios.all = function all(promises) {
    return Promise.all(promises);
};
axios.spread = function spread(callback) {
    return function wrap(arr) {
        return callback.apply(null, arr);
    };
};
axios.Axios = Axios;

export default axios;
//# sourceMappingURL=axios.es5.js.map
