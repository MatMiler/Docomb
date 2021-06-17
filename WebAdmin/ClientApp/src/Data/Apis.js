var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SessionCache } from './SessionCache';
import { Utils } from './Utils';
export var Apis;
(function (Apis) {
    /**
     * Load a JSON from URL
     * @param url URL from which to load
     * @param cache Whether the value should be cached in browser (sessionStorage)
     * @param cacheOptions Caching options
     */
    function fetchJsonAsync(url, cache = false, cacheOptions = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let cacheKey = Utils.tryGetString(cacheOptions, "key", url);
            if (cache == true) {
                let storedItem = SessionCache.getItem(cacheKey);
                if (storedItem != null)
                    return storedItem.value;
            }
            let response = yield fetch(url);
            let data = yield response.json();
            if (cache == true) {
                SessionCache.save(cacheKey, data, Utils.tryGetNumber(cacheOptions, "expiry", null));
            }
            return data;
        });
    }
    Apis.fetchJsonAsync = fetchJsonAsync;
    /**
     * Load a JSON from URL and execute a callback with the value
     * @param url URL from which to load
     * @param cache Whether the value should be cached in browser (sessionStorage)
     * @param cacheOptions Caching options
     * @param returnCall Callback through which the value is returned
     */
    function fetchJson(url, cache = false, cacheOptions = null, returnCall) {
        return __awaiter(this, void 0, void 0, function* () {
            returnCall(yield fetchJsonAsync(url, cache, cacheOptions));
        });
    }
    Apis.fetchJson = fetchJson;
    /**
     * Post an object to the URL and return its response (JSON)
     * @param url URL to which the data is to be sent
     * @param data Data to send
     */
    function postJsonAsync(url, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let fetchData = { method: "POST", body: JSON.stringify(data), headers: { "Content-type": "application/json; charset=UTF-8" } };
            let response = yield fetch(url, fetchData);
            let receivedData = yield response.json();
            return receivedData;
        });
    }
    Apis.postJsonAsync = postJsonAsync;
})(Apis || (Apis = {}));
//# sourceMappingURL=Apis.js.map