export module Utils {

	//#region Parse values

	/**
	 * Convert a value to string
	 * @param value Value to convert
	 * @param defaultValue Default value to return if result would be null or empty
	 */
	export function parseString(value: any, defaultValue: string = ""): string {
		if (typeof value == "string") return value;
		if ((value == null) || (value == undefined)) return defaultValue;
		try {
			let s = value.toString();
			if (typeof s == "string") return s;
		}
		catch (e) { }
		return defaultValue;
	}

	/**
	 * Convert a value to number
	 * @param value Value to convert
	 * @param defaultValue Default value to return if null or can't be converted
	 */
	export function parseNum(value: any, defaultValue?: number): number {
		if (defaultValue === undefined) defaultValue = 0;
		if ((typeof value == "number") && (!isNaN(value))) return value;
		value = parseFloat(value);
		return ((typeof value == "number") && (!isNaN(value))) ? value : defaultValue;
	}

	/**
	 * Convert a value to boolean
	 * @param value Value to convert
	 * @param defaultValue Default value to return if null or can't be converted
	 */
	export function parseBool(value: any, defaultValue?: boolean): boolean {
		switch (value) {
			case true: case "true": case "yes": case 1: case "1": return true;
			case false: case "false": case "no": case 0: case "0": return false;
		}
		return defaultValue;
	}

	/**
	 * Convert a value to enumerator
	 * @param value Value to convert
	 * @param set Set of all available values / Reference to the enumerator
	 * @param defaultValue Default value if searched value is not present in the set
	 */
	export function parseEnum<T>(value: any, set: { [key: string]: any }, defaultValue: T): T {
		if (getObjectValues(set).includes(value)) return value;
		return defaultValue;
	}

	/**
	 * Convert a value to date
	 * @param value Value to convert
	 * @param defaultValue Default value to return if null or can't be converted
	 */
	export function parseDate(value: any, defaultValue?: Date): Date {
		try {
			let date = new Date(value);
			return (isNumeric(date.getTime())) ? date : defaultValue;
		}
		catch (e) {}
		return defaultValue;
	}

	//#endregion










	//#region Type checks

	/**
	 * Check whether a value is of a specified type
	 * @param value Value to check
	 * @param type Type to check
	 */
	export function isType(value: any, type: string | Function): boolean {
		if (value === null) return ((type === "null") || (type === null));
		if (value === undefined) return ((type === "undefined") || (type === undefined));
		if (typeof type == "string") return (typeof value == type);
		if (typeof type == "function") return (value instanceof type);
		return false;
	}

	/**
	 * Check whether a value is of any of the specified types
	 * @param value Value to check 
	 * @param types Types to check
	 */
	export function IsAnyType(value: any, ...types: Array<string | Function>): boolean {
		if ((types == null) || (!isType(types, Array))) return false;
		for (let x = 0; x < types.length; x++) {
			if (isType(value, types[x])) return true;
		}
		return false;
	}

	/**
	 * Return value if of a certain type, otherwise default value
	 * @param value Value to check & return
	 * @param type Type to check
	 * @param defaultValue Default value if "main" value isn't of the right type
	 */
	export function ifTypeOrDefault<T>(value: any, type: string | Function, defaultValue: T = null): T {
		return (isType(value, type)) ? value : defaultValue;
	}

	/**
	 * Check whether a value is a valid number; null, undefined and NaN will return false
	 * @param value Value to check
	 */
	export function isNumeric(value: any): boolean {
		if ((value == null) || (value == undefined) || (isNaN(value))) return false;
		return (typeof value == "number");
	}

	//#endregion










	//#region String utils

	/**
	 * Convert a value to string and remove leading and trailing spaces
	 * @param value Value to trim
	 * @param defaultValue Default value to return if null or empty
	 */
	export function trimString(value: any, defaultValue?: string) {
		if (defaultValue === undefined) defaultValue = "";
		if ((value == null) || (value == undefined)) return defaultValue;
		if (typeof value == "string") { let s = value.trim(); return (s != "") ? s : defaultValue; }
		try { let s: string = value.toString().trim(); return (s != "") ? s : defaultValue; }
		catch (e) { }
		return defaultValue;
	}

	export function firstStringPart(value: string, separator: string) {
		if ((value == null) || (value == "") || (separator == null) || (separator == "")) return value;
		let pos = value.indexOf(separator);
		return (pos > 0) ? value.substring(0, pos) : (pos == 0) ? "" : value;
	}

	export function lastStringPart(value: string, separator: string) {
		if ((value == null) || (value == "") || (separator == null) || (separator == "")) return value;
		let pos = value.lastIndexOf(separator);
		return (pos >= 0) ? value.substring(pos + separator.length) : value;
	}

	export function padWithSlash(value: string, atStart: boolean = true, atEnd: boolean = true): string {
		value = trimString(value, "");
		if ((atStart == true) && (!value.startsWith("/"))) value = "/" + value;
		if ((atEnd == true) && (!value.endsWith("/"))) value += "/";
		return value;
	}

	//#endregion










	//#region Arrays & Objects

	/**
	 * Check whether a value is an array and has any values
	 * @param array Value to check
	 */
	export function arrayHasValues(array: Array<any>): boolean {
		return (isType(array, Array)) && (array.length > 0);
	}

	/**
	 * Converts an array of values to another type and validates each new value
	 * @param data Array of data to convert
	 * @param conversion Conversion function
	 * @param validation Function with which to validate the new item
	 * @param includeNull Should null values be included in the new array
	 */
	export function mapArray<T>(data: any, conversion: (source: any) => T, validation: (item: T) => boolean = null, includeNull: boolean = false): Array<T> {
		if (!arrayHasValues(data)) return null;
		let list: Array<T> = [];
		for (let x = 0; x < data.length; x++) {
			let item: T = null;
			try { item = conversion(data[x]); } catch (e) { }
			if ((validation != null) && (validation(item) != true)) item = null;
			if ((includeNull == true) || (item != null))
				list.push(item);
		}
		return list;
	}

	/**
	 * Get array of all keys in an object
	 * @param object Object from which to extract keys
	 */
	export function getObjectKeys(object: object): Array<string> {
		var list = [];
		for (var key in object)
			if (object.hasOwnProperty(key))
				list.push(key);
		return list;
	}

	/**
	 * Get array of all values in an object
	 * @param object Object from which to extract values
	 */
	export function getObjectValues(object: any): Array<any> {
		var list = [];
		for (var value in object)
			list.push(object[value]);
		return list;
	}

	/**
	 * Check whether the object has the specified key
	 * @param object Object in which to check for key
	 * @param key Key to look for
	 */
	export function hasObjectKey(object: object, key: string): boolean {
		for (var s in object)
			if (s == key)
				return true;
		return false;
	}

	//#endregion










	//#region Try get property

	/**
	 * Try to return a property or index of an object
	 * Examples:
	 * - tryGet({ a: "Value 1" }, "a") => "Value 1"
	 * - tryGet(["Value 1", "Value 2"], 0) => "Value 1"
	 * - tryGet([{ a: "Value 1"}, { a: "Value 2" }], [1, "a"]) => "Value 2"
	 * @param container Container object in which to look for the property/index
	 * @param property Property or index (or array of properties/indexes) to find
	 * @param defaultValue Default value if property/index is not found
	 */
	export function tryGet(container: any, property: any, defaultValue?: any): any {
		if (defaultValue == undefined) defaultValue = null;
		if ((container == null) || (container == undefined)) return defaultValue;
		if (typeof container == "string") {
			try { container = eval(container); }
			catch (e) { }
			if ((container == null) || (container == undefined)) return defaultValue;
		}
		if (!(container instanceof Object) && !(container instanceof Array)) return defaultValue;
		try {
			if (property instanceof Array) {
				for (let x = 0; x < property.length; x++) {
					let a = container[property[x]];
					if ((a != null) || (a != undefined))
						container = a;
					else
						return defaultValue;
				}
				return container;
			}
			{
				let a = container[property];
				if ((a != null) || (a != undefined)) return a;
			}
		}
		catch (e) { return defaultValue; }
		return defaultValue;
	}

	/**
	 * Try to get a given property of each of the items in an array
	 * @param array Container array
	 * @param property Property or index (or array of properties/indexes) to find
	 * @param defaultValue Default value if property/index is not found
	 * @param ignoreNull Whether to remove or include null values
	 */
	export function tryGetArray(array: Array<any>, property: any, defaultValue?: any, ignoreNull: boolean = true): Array<any> {
		if ((array == null) || !(array.length > 0)) return [];
		let list = [];
		for (let x = 0; x < array.length; x++) {
			let value = tryGet(array[x], property, defaultValue);
			if ((!ignoreNull) || (value != null)) list.push(value);
		}
		return list;
	}

	/**
	 * Try to return a string in a property or index of an object. If found value isn't a string, it will be converted
	 * Examples:
	 * - tryGetString({ a: "Value 1" }, "a") => "Value 1"
	 * - tryGetString(["Value 1", "Value 2"], 0) => "Value 1"
	 * - tryGetString([{ a: "Value 1"}, { a: "Value 2" }], [1, "a"]) => "Value 2"
	 * @param container Container object in which to look for the property/index
	 * @param property Property or index (or array of properties/indexes) to find
	 * @param defaultValue Default value if property/index is not found or is null or empty
	 */
	export function tryGetString(container: any, property: any, defaultValue?: string): string {
		return parseString(tryGet(container, property, defaultValue), defaultValue);
	}

	/**
	 * Try to return a trimmed string in a property or index of an object. If found value isn't a string, it will be converted
	 * Examples:
	 * - tryGetString({ a: "Value 1" }, "a") => "Value 1"
	 * - tryGetString(["Value 1", "Value 2"], 0) => "Value 1"
	 * - tryGetString([{ a: "Value 1"}, { a: "Value 2" }], [1, "a"]) => "Value 2"
	 * @param container Container object in which to look for the property/index
	 * @param property Property or index (or array of properties/indexes) to find
	 * @param defaultValue Default value if property/index is not found or is null or empty
	 */
	export function tryGetTrimmedString(container: any, property: any, defaultValue: string = null): string {
		return trimString(tryGet(container, property, defaultValue), defaultValue);
	}

	/**
	 * Try to return a number in a property or index of an object. If found value isn't a number, it will be converted
	 * Examples:
	 * - tryGetNumber({ a: 1 }, "a") => 1
	 * - tryGetNumber([1, 2, 3], 2) => 3
	 * - tryGetNumber([{ a: 1}, { a: 2 }], [1, "a"]) => 2
	 * @param container Container object in which to look for the property/index
	 * @param property Property or index (or array of properties/indexes) to find
	 * @param defaultValue Default value if property/index is not found, is null, or can't be converted into a number
	 */
	export function tryGetNumber(container: any, property: any, defaultValue?: number): number {
		return parseNum(tryGet(container, property, defaultValue), defaultValue);
	}

	/**
	 * Try to return a boolean in a property or index of an object. If found value isn't a boolean, it will be converted
	 * Examples:
	 * - tryGetNumber({ a: true }, "a") => true
	 * - tryGetNumber([false, true, false], 2) => false
	 * - tryGetNumber([{ a: false}, { a: true }], [1, "a"]) => true
	 * @param container Container object in which to look for the property/index
	 * @param property Property or index (or array of properties/indexes) to find
	 * @param defaultValue Default value if property/index is not found, is null, or can't be converted into a boolean
	 */
	export function tryGetBool(container: any, property: any, defaultValue?: boolean): boolean {
		return parseBool(tryGet(container, property, defaultValue), defaultValue);
	}

	/**
	 * Try to return an enumerator value in a property or index of an object. If the value isn't found, the default value will be returned
	 * @param container Container object in which to look for the property/index
	 * @param property Property or index (or array of properties/indexes) to find
	 * @param set Set of all available values / Reference to the enumerator
	 * @param defaultValue Default value if property/index is not found, is null, or can't be converted into a boolean
	 */
	export function tryGetEnum<T>(container: any, property: any, set: { [key: string]: any }, defaultValue?: T): T {
		return parseEnum(tryGet(container, property, defaultValue), set, defaultValue);
	}

	/**
	 * Try to return a date in a property or index of an object. If found value isn't a date, it will be converted
	 * @param container Container object in which to look for the property/index
	 * @param property Property or index (or array of properties/indexes) to find
	 * @param defaultValue Default value if property/index is not found, is null, or can't be converted into a date
	 */
	export function tryGetDate(container: any, property: any, defaultValue?: Date): Date {
		return parseDate(tryGet(container, property, defaultValue), defaultValue);
	}


	//#endregion



}
