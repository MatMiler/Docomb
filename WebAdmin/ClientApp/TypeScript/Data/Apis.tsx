import { SessionCache } from './SessionCache';
import { Utils } from './Utils';

export module Apis {
	/** Options for storing API requests in browser cache (sessionStorage) */
	export interface CacheOptions {
		/** Key under which to save value; By default the requested URL is used as key */
		key?: string;
		/** When the value should expire */
		expiry?: Date | number | null;
	}

	/**
	 * Load a JSON from URL
	 * @param url URL from which to load
	 * @param cache Whether the value should be cached in browser (sessionStorage)
	 * @param cacheOptions Caching options
	 */
	export async function fetchJsonAsync(url: string, cache: boolean = false, cacheOptions: CacheOptions = null): Promise<any> {
		let cacheKey: string = Utils.tryGetString(cacheOptions, "key", url);
		if (cache == true) {
			let storedItem: SessionCache.Item = SessionCache.getItem(cacheKey);
			if (storedItem != null) return storedItem.value;
		}
		let response: Response = await fetch(url);
		let data: any = await response.json();
		if (cache == true) {
			SessionCache.save(cacheKey, data, Utils.tryGetNumber(cacheOptions, "expiry", null));
		}
		return data;
	}

	/**
	 * Load a JSON from URL and execute a callback with the value
	 * @param url URL from which to load
	 * @param cache Whether the value should be cached in browser (sessionStorage)
	 * @param cacheOptions Caching options
	 * @param returnCall Callback through which the value is returned
	 */
	export async function fetchJson<T>(url: string, cache: boolean = false, cacheOptions: CacheOptions = null, returnCall: (any) => void): Promise<void> {

		returnCall(await fetchJsonAsync(url, cache, cacheOptions));
	}

	/**
	 * Post an object to the URL and return its response (JSON)
	 * @param url URL to which the data is to be sent
	 * @param data Data to send
	 */
	export async function postJsonAsync(url: string, data: any): Promise<any> {
		let fetchData: RequestInit = { method: "POST", body: JSON.stringify(data), headers: { "Content-type": "application/json; charset=UTF-8" } };
		let response: Response = await fetch(url, fetchData);
		let receivedData: any = await response.json();
		return receivedData;
	}


	export enum ActionStatusCode {
		OK = "OK",
		Error = "Error",
		NotFound = "NotFound",
		MissingRequestData = "MissingRequestData",
		InvalidRequestData = "InvalidRequestData",
		ActionNotSupported = "ActionNotSupported",
		DataNotSupported = "DataNotSupported",
		Conflict = "Conflict"
	}
	export enum ActionStatusCategory {
		OK = "OK",
		ClientIssue = "ClientIssue",
		ServerIssue = "ServerIssue",
		SecurityIssue = "SecurityIssue",
		UnknownIssue = "UnknownIssue"
	}
	export class ActionStatus {
		public status: ActionStatusCode;
		public category: ActionStatusCategory;
		public message: string;
		public isOk: boolean;

		public constructor(source: any) {
			this.isOk = Utils.tryGetBool(source, "isOk", false);
			this.status = Utils.tryGetEnum(source, "status", ActionStatusCode, this.isOk ? ActionStatusCode.OK : ActionStatusCode.Error);
			this.category = Utils.tryGetEnum(source, "category", ActionStatusCategory, this.isOk ? ActionStatusCategory.OK : ActionStatusCategory.UnknownIssue);
			this.message = Utils.tryGetTrimmedString(source, "message");
		}

		public getDialogMessage(): string {
			if (this.message != null) return this.message;
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

}

