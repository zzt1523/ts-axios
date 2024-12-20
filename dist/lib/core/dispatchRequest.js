"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xhr_1 = require("../xhr");
var url_1 = require("../helpers/url");
var headers_1 = require("../helpers/headers");
var transform_1 = require("./transform");
function dispatchRequest(config) {
    throwIfCancellationRequested(config);
    processConfigConfig(config);
    return xhr_1.default(config).then(function (res) {
        return transformResponseData(res);
    }, function (e) {
        if (e && e.response) {
            e.response = transformResponseData(e.response);
        }
        return Promise.reject(e);
    });
}
exports.default = dispatchRequest;
function processConfigConfig(config) {
    config.url = transformURL(config);
    config.data = transform_1.default(config.data, config.headers, config.transformRequest);
    config.headers = headers_1.flattenHeaders(config.headers, config.method);
}
function transformURL(config) {
    var url = config.url, params = config.params, paramsSerializer = config.paramsSerializer, baseURL = config.baseURL;
    if (baseURL && !url_1.isAbsoluteURL(url)) {
        url = url_1.combineURL(baseURL, url);
    }
    return url_1.buildURL(url, params, paramsSerializer);
}
exports.transformURL = transformURL;
function transformResponseData(res) {
    res.data = transform_1.default(res.data, res.headers, res.config.transformResponse);
    return res;
}
function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
    }
}
// export default axios
