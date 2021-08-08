import { Utils } from "./Utils";

export module SessionCache {

	/** Saved item package (value + metadata) */
	export class Item {
		/** Unique key of the cached item */
		public key: string;
		/** Cached value */
		public value: any;
		/** Time when the value was saved */
		public timestamp: number;
		/** Time when the value expires and can no longer be used */
		public expiry: number;
		/** Value's hash, to validate  */
		public hash: number;

		/**
		 * Create new item package
		 * @param key Key of the stored item
		 * @param value Value to save
		 * @param expiry Time when the value expires
		 */
		public constructor(key: string, value: any, expiry: Date | number | null) {
			this.key = key;
			this.value = value;
			this.expiry = (expiry instanceof Date) ? expiry.getTime() : expiry;
			if ((this.expiry != null) && (this.expiry < 86400000)) this.expiry = Date.now() + this.expiry;
			this.hash = Utils.hashCode(value);
			this.timestamp = Date.now();
		}

		/**
		 * Parse the item from a serialized string and check its validity
		 * @param s String to deserialize
		 */
		public static deserialize(s: string): Item {
			try {
				let data = JSON.parse(s);
				if (data == null) return null;
				let key: string = Utils.tryGetString(data, "key");
				let value: any = Utils.tryGet(data, "value");
				let timestamp: number = Utils.tryGetNumber(data, "value", null);
				let expiry: number = Utils.tryGetNumber(data, "expiry", null);
				let hash: number = Utils.tryGetNumber(data, "hash", null);
				if ((expiry != null) && (expiry <= Date.now())) return null; // Expired
				let item: Item = new Item(key, value, expiry);
				item.timestamp = timestamp;
				return (item.hash == hash) ? item : null; // Check hash to see that data hasn't been changed or corrupted
			}
			catch (e) { }

			return null;
		}

		public serialize(): string {
			return JSON.stringify(this);
		}
	}

	/** Prefix for keys stored in sessionStorage through this module */
	export const keyPrefix: string = "docombCache-";

	/**
	 * Retreive a cached item package
	 * @param key Key of the stored item
	 */
	export function getItem(key: string): Item {
		if ((key == null) || (key == "")) return null; // No key specified
		let s: string = window.sessionStorage.getItem(keyPrefix + key);
		if ((s == null) || (s == "")) return null; // Nothing is saved under this key
		return Item.deserialize(s);
	}

	/**
	 * Check if anything is stored under the given key
	 * @param key Key of the stored value
	 */
	export function has(key: string): boolean {
		let item: Item = getItem(key);
		return (item != null);
	}

	/**
	 * Retreive a cached value
	 * @param key Key of the stored item
	 */
	export function get(key: string): any {
		let item: Item = getItem(key);
		return (item != null) ? item.value : null;
	}

	/**
	 * Save value to cache
	 * @param key Key of the stored item
	 * @param value Value to save
	 * @param expiry Time when the value expires
	 */
	export function save(key: string, value: any, expiry: Date | number | null = null): void {
		if ((key == null) || (key == "")) return; // No key specified
		let item: Item = new Item(key, value, expiry);
		window.sessionStorage.setItem(keyPrefix + key, item.serialize());
	}

	export function remove(key: string): void {
		window.sessionStorage.removeItem(keyPrefix + key);
	}


}