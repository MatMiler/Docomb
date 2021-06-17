export var Utils;
(function (Utils) {
    //#region Parse values
    /**
     * Convert a value to string
     * @param value Value to convert
     * @param defaultValue Default value to return if result would be null or empty
     */
    function parseString(value, defaultValue = "") {
        if (typeof value == "string")
            return value;
        if ((value == null) || (value == undefined))
            return defaultValue;
        try {
            let s = value.toString();
            if (typeof s == "string")
                return s;
        }
        catch (e) { }
        return defaultValue;
    }
    Utils.parseString = parseString;
    /**
     * Convert a value to number
     * @param value Value to convert
     * @param defaultValue Default value to return if null or can't be converted
     */
    function parseNum(value, defaultValue) {
        if (defaultValue === undefined)
            defaultValue = 0;
        if ((typeof value == "number") && (!isNaN(value)))
            return value;
        value = parseFloat(value);
        return ((typeof value == "number") && (!isNaN(value))) ? value : defaultValue;
    }
    Utils.parseNum = parseNum;
    /**
     * Convert a value to boolean
     * @param value Value to convert
     * @param defaultValue Default value to return if null or can't be converted
     */
    function parseBool(value, defaultValue) {
        switch (value) {
            case true:
            case "true":
            case "yes":
            case 1:
            case "1": return true;
            case false:
            case "false":
            case "no":
            case 0:
            case "0": return false;
        }
        return defaultValue;
    }
    Utils.parseBool = parseBool;
    /**
     * Convert a value to enumerator
     * @param value Value to convert
     * @param set Set of all available values / Reference to the enumerator
     * @param defaultValue Default value if searched value is not present in the set
     */
    function parseEnum(value, set, defaultValue) {
        if (getObjectValues(set).includes(value))
            return value;
        return defaultValue;
    }
    Utils.parseEnum = parseEnum;
    /**
     * Convert a value to date
     * @param value Value to convert
     * @param defaultValue Default value to return if null or can't be converted
     */
    function parseDate(value, defaultValue) {
        try {
            let date = new Date(value);
            return (isNumeric(date.getTime())) ? date : defaultValue;
        }
        catch (e) { }
        return defaultValue;
    }
    Utils.parseDate = parseDate;
    //#endregion
    //#region Type checks
    /**
     * Check whether a value is of a specified type
     * @param value Value to check
     * @param type Type to check
     */
    function isType(value, type) {
        if (value === null)
            return ((type === "null") || (type === null));
        if (value === undefined)
            return ((type === "undefined") || (type === undefined));
        if (typeof type == "string")
            return (typeof value == type);
        if (typeof type == "function")
            return (value instanceof type);
        return false;
    }
    Utils.isType = isType;
    /**
     * Check whether a value is of any of the specified types
     * @param value Value to check
     * @param types Types to check
     */
    function IsAnyType(value, ...types) {
        if ((types == null) || (!isType(types, Array)))
            return false;
        for (let x = 0; x < types.length; x++) {
            if (isType(value, types[x]))
                return true;
        }
        return false;
    }
    Utils.IsAnyType = IsAnyType;
    /**
     * Return value if of a certain type, otherwise default value
     * @param value Value to check & return
     * @param type Type to check
     * @param defaultValue Default value if "main" value isn't of the right type
     */
    function ifTypeOrDefault(value, type, defaultValue = null) {
        return (isType(value, type)) ? value : defaultValue;
    }
    Utils.ifTypeOrDefault = ifTypeOrDefault;
    /**
     * Check whether a value is a valid number; null, undefined and NaN will return false
     * @param value Value to check
     */
    function isNumeric(value) {
        if ((value == null) || (value == undefined) || (isNaN(value)))
            return false;
        return (typeof value == "number");
    }
    Utils.isNumeric = isNumeric;
    //#endregion
    //#region String utils
    /**
     * Convert a value to string and remove leading and trailing spaces
     * @param value Value to trim
     * @param defaultValue Default value to return if null or empty
     */
    function trimString(value, defaultValue) {
        if (defaultValue === undefined)
            defaultValue = "";
        if (typeof value == "string") {
            let s = value.trim();
            return (s != "") ? s : defaultValue;
        }
        try {
            let s = value.toString().trim();
            return (s != "") ? s : defaultValue;
        }
        catch (e) { }
        return defaultValue;
    }
    Utils.trimString = trimString;
    function firstStringPart(value, separator) {
        if ((value == null) || (value == "") || (separator == null) || (separator == ""))
            return value;
        let pos = value.indexOf(separator);
        return (pos > 0) ? value.substring(0, pos) : (pos == 0) ? "" : value;
    }
    Utils.firstStringPart = firstStringPart;
    function lastStringPart(value, separator) {
        if ((value == null) || (value == "") || (separator == null) || (separator == ""))
            return value;
        let pos = value.lastIndexOf(separator);
        return (pos >= 0) ? value.substring(pos + separator.length) : value;
    }
    Utils.lastStringPart = lastStringPart;
    //#endregion
    //#region Arrays & Objects
    /**
     * Check whether a value is an array and has any values
     * @param array Value to check
     */
    function arrayHasValues(array) {
        return (isType(array, Array)) && (array.length > 0);
    }
    Utils.arrayHasValues = arrayHasValues;
    /**
     * Converts an array of values to another type and validates each new value
     * @param data Array of data to convert
     * @param conversion Conversion function
     * @param validation Function with which to validate the new item
     * @param includeNull Should null values be included in the new array
     */
    function mapArray(data, conversion, validation = null, includeNull = false) {
        if (!arrayHasValues(data))
            return null;
        let list = [];
        for (let x = 0; x < data.length; x++) {
            let item = null;
            try {
                item = conversion(data[x]);
            }
            catch (e) { }
            if ((validation != null) && (validation(item) != true))
                item = null;
            if ((includeNull == true) || (item != null))
                list.push(item);
        }
        return list;
    }
    Utils.mapArray = mapArray;
    /**
     * Get array of all keys in an object
     * @param object Object from which to extract keys
     */
    function getObjectKeys(object) {
        var list = [];
        for (var key in object)
            if (object.hasOwnProperty(key))
                list.push(key);
        return list;
    }
    Utils.getObjectKeys = getObjectKeys;
    /**
     * Get array of all values in an object
     * @param object Object from which to extract values
     */
    function getObjectValues(object) {
        var list = [];
        for (var value in object)
            list.push(object[value]);
        return list;
    }
    Utils.getObjectValues = getObjectValues;
    /**
     * Check whether the object has the specified key
     * @param object Object in which to check for key
     * @param key Key to look for
     */
    function hasObjectKey(object, key) {
        for (var s in object)
            if (s == key)
                return true;
        return false;
    }
    Utils.hasObjectKey = hasObjectKey;
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
    function tryGet(container, property, defaultValue) {
        if (defaultValue == undefined)
            defaultValue = null;
        if ((container == null) || (container == undefined))
            return defaultValue;
        if (typeof container == "string") {
            try {
                container = eval(container);
            }
            catch (e) { }
            if ((container == null) || (container == undefined))
                return defaultValue;
        }
        if (!(container instanceof Object) && !(container instanceof Array))
            return defaultValue;
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
                if ((a != null) || (a != undefined))
                    return a;
            }
        }
        catch (e) {
            return defaultValue;
        }
        return defaultValue;
    }
    Utils.tryGet = tryGet;
    /**
     * Try to get a given property of each of the items in an array
     * @param array Container array
     * @param property Property or index (or array of properties/indexes) to find
     * @param defaultValue Default value if property/index is not found
     * @param ignoreNull Whether to remove or include null values
     */
    function tryGetArray(array, property, defaultValue, ignoreNull = true) {
        if ((array == null) || !(array.length > 0))
            return [];
        let list = [];
        for (let x = 0; x < array.length; x++) {
            let value = tryGet(array[x], property, defaultValue);
            if ((!ignoreNull) || (value != null))
                list.push(value);
        }
        return list;
    }
    Utils.tryGetArray = tryGetArray;
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
    function tryGetString(container, property, defaultValue) {
        return parseString(tryGet(container, property, defaultValue), defaultValue);
    }
    Utils.tryGetString = tryGetString;
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
    function tryGetTrimmedString(container, property, defaultValue = null) {
        return trimString(tryGet(container, property, defaultValue), defaultValue);
    }
    Utils.tryGetTrimmedString = tryGetTrimmedString;
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
    function tryGetNumber(container, property, defaultValue) {
        return parseNum(tryGet(container, property, defaultValue), defaultValue);
    }
    Utils.tryGetNumber = tryGetNumber;
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
    function tryGetBool(container, property, defaultValue) {
        return parseBool(tryGet(container, property, defaultValue), defaultValue);
    }
    Utils.tryGetBool = tryGetBool;
    /**
     * Try to return an enumerator value in a property or index of an object. If the value isn't found, the default value will be returned
     * @param container Container object in which to look for the property/index
     * @param property Property or index (or array of properties/indexes) to find
     * @param set Set of all available values / Reference to the enumerator
     * @param defaultValue Default value if property/index is not found, is null, or can't be converted into a boolean
     */
    function tryGetEnum(container, property, set, defaultValue) {
        return parseEnum(tryGet(container, property, defaultValue), set, defaultValue);
    }
    Utils.tryGetEnum = tryGetEnum;
    /**
     * Try to return a date in a property or index of an object. If found value isn't a date, it will be converted
     * @param container Container object in which to look for the property/index
     * @param property Property or index (or array of properties/indexes) to find
     * @param defaultValue Default value if property/index is not found, is null, or can't be converted into a date
     */
    function tryGetDate(container, property, defaultValue) {
        return parseDate(tryGet(container, property, defaultValue), defaultValue);
    }
    Utils.tryGetDate = tryGetDate;
    //#endregion
})(Utils || (Utils = {}));
//# sourceMappingURL=Utils.js.map