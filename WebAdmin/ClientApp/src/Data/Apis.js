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
            let data = null;
            try {
                let response = yield fetch(url);
                data = yield response.json();
            }
            catch (e) { }
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
            let receivedData = null;
            try {
                let response = yield fetch(url, fetchData);
                receivedData = yield response.json();
            }
            catch (e) { }
            return receivedData;
        });
    }
    Apis.postJsonAsync = postJsonAsync;
    function postFormAsync(url, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let fetchData = { method: "POST", body: data };
            let receivedData = null;
            try {
                let response = yield fetch(url, fetchData);
                receivedData = yield response.json();
            }
            catch (e) { }
            return receivedData;
        });
    }
    Apis.postFormAsync = postFormAsync;
    let ActionStatusCode;
    (function (ActionStatusCode) {
        ActionStatusCode["OK"] = "OK";
        ActionStatusCode["Error"] = "Error";
        ActionStatusCode["NotFound"] = "NotFound";
        ActionStatusCode["MissingRequestData"] = "MissingRequestData";
        ActionStatusCode["InvalidRequestData"] = "InvalidRequestData";
        ActionStatusCode["ActionNotSupported"] = "ActionNotSupported";
        ActionStatusCode["DataNotSupported"] = "DataNotSupported";
        ActionStatusCode["Conflict"] = "Conflict";
    })(ActionStatusCode = Apis.ActionStatusCode || (Apis.ActionStatusCode = {}));
    let ActionStatusCategory;
    (function (ActionStatusCategory) {
        ActionStatusCategory["OK"] = "OK";
        ActionStatusCategory["ClientIssue"] = "ClientIssue";
        ActionStatusCategory["ServerIssue"] = "ServerIssue";
        ActionStatusCategory["SecurityIssue"] = "SecurityIssue";
        ActionStatusCategory["UnknownIssue"] = "UnknownIssue";
    })(ActionStatusCategory = Apis.ActionStatusCategory || (Apis.ActionStatusCategory = {}));
    class ActionStatus {
        constructor(source) {
            this.isOk = Utils.tryGetBool(source, "isOk", false);
            this.status = Utils.tryGetEnum(source, "status", ActionStatusCode, this.isOk ? ActionStatusCode.OK : ActionStatusCode.Error);
            this.category = Utils.tryGetEnum(source, "category", ActionStatusCategory, this.isOk ? ActionStatusCategory.OK : ActionStatusCategory.UnknownIssue);
            this.message = Utils.tryGetTrimmedString(source, "message");
        }
        getDialogMessage() {
            if (this.message != null)
                return this.message;
            switch (this.status) {
                case ActionStatusCode.NotFound: return "Can't find resource.";
                case ActionStatusCode.MissingRequestData: return "Not enough information.";
                case ActionStatusCode.InvalidRequestData: return "Data is not valid.";
                case ActionStatusCode.ActionNotSupported: return "Action is not supported.";
                case ActionStatusCode.DataNotSupported: return "Data is not supported.";
                case ActionStatusCode.Conflict: return "There's a conflict preventing the action.";
            }
            return "A problem has occurred.";
        }
    }
    Apis.ActionStatus = ActionStatus;
    class DataWithStatus {
        constructor(actionStatus, data) {
            this.actionStatus = actionStatus;
            this.data = data;
        }
    }
    Apis.DataWithStatus = DataWithStatus;
})(Apis || (Apis = {}));
//# sourceMappingURL=Apis.js.map