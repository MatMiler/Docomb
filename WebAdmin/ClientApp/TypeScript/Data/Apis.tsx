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
		let cacheKey: string = Utils.TryGetString(cacheOptions, "key", url);
		if (cache == true) {
			let storedItem: SessionCache.Item = SessionCache.getItem(cacheKey);
			if (storedItem != null) return storedItem.value;
		}
		let response: Response = await fetch(url);
		let data: any = await response.json();
		if (cache == true) {
			SessionCache.save(cacheKey, data, Utils.TryGetNumber(cacheOptions, "expiry", null));
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

}

