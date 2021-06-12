export var Utils;
(function (Utils) {
    //#region Parse values
    /**
     * Convert a value to string
     * @param value Value to convert
     * @param defaultValue Default value to return if result would be null or empty
     */
    function ParseString(value, defaultValue = "") {
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
    Utils.ParseString = ParseString;
    /**
     * Convert a value to number
     * @param value Value to convert
     * @param defaultValue Default value to return if null or can't be converted
     */
    function ParseNum(value, defaultValue) {
        if (defaultValue === undefined)
            defaultValue = 0;
        if ((typeof value == "number") && (!isNaN(value)))
            return value;
        value = parseFloat(value);
        return ((typeof value == "number") && (!isNaN(value))) ? value : defaultValue;
    }
    Utils.ParseNum = ParseNum;
    /**
     * Convert a value to boolean
     * @param value Value to convert
     * @param defaultValue Default value to return if null or can't be converted
     */
    function ParseBool(value, defaultValue) {
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
    Utils.ParseBool = ParseBool;
    //#endregion
    //#region Type checks
    /**
     * Check whether a value is of a specified type
     * @param value Value to check
     * @param type Type to check
     */
    function IsType(value, type) {
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
    Utils.IsType = IsType;
    /**
     * Check whether a value is of any of the specified types
     * @param value Value to check
     * @param types Types to check
     */
    function IsAnyType(value, ...types) {
        if ((types == null) || (!IsType(types, Array)))
            return false;
        for (let x = 0; x < types.length; x++) {
            if (IsType(value, types[x]))
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
    function IfTypeOrDefault(value, type, defaultValue = null) {
        return (IsType(value, type)) ? value : defaultValue;
    }
    Utils.IfTypeOrDefault = IfTypeOrDefault;
    /**
     * Check whether a value is a valid number; null, undefined and NaN will return false
     * @param value Value to check
     */
    function IsNumeric(value) {
        if ((value == null) || (value == undefined) || (isNaN(value)))
            return false;
        return (typeof value == "number");
    }
    Utils.IsNumeric = IsNumeric;
    //#endregion
    //#region String utils
    /**
     * Convert a value to string and remove leading and trailing spaces
     * @param value Value to trim
     * @param defaultValue Default value to return if null or empty
     */
    function TrimString(value, defaultValue) {
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
    Utils.TrimString = TrimString;
    //#endregion
    //#region Arrays
    /**
     * Check whether a value is an array and has any values
     * @param array Value to check
     */
    function ArrayHasValues(array) {
        return (IsType(array, Array)) && (array.length > 0);
    }
    Utils.ArrayHasValues = ArrayHasValues;
    //#endregion
    //#region Try get property
    /**
     * Try to return a property or index of an object
     * Examples:
     * - TryGet({ a: "Value 1" }, "a") => "Value 1"
     * - TryGet(["Value 1", "Value 2"], 0) => "Value 1"
     * - TryGet([{ a: "Value 1"}, { a: "Value 2" }], [1, "a"]) => "Value 2"
     * @param container Container object in which to look for the property/index
     * @param property Property or index (or array of properties/indexes) to find
     * @param defaultValue Default value if property/index is not found
     */
    function TryGet(container, property, defaultValue) {
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
    Utils.TryGet = TryGet;
    /**
     * Try to get a given property of each of the items in an array
     * @param array Container array
     * @param property Property or index (or array of properties/indexes) to find
     * @param defaultValue Default value if property/index is not found
     * @param ignoreNull Whether to remove or include null values
     */
    function TryGetArray(array, property, defaultValue, ignoreNull = true) {
        if ((array == null) || !(array.length > 0))
            return [];
        let list = [];
        for (let x = 0; x < array.length; x++) {
            let value = TryGet(array[x], property, defaultValue);
            if ((!ignoreNull) || (value != null))
                list.push(value);
        }
        return list;
    }
    Utils.TryGetArray = TryGetArray;
    /**
     * Try to return a string in a property or index of an object. If found value isn't a string, it will be converted
     * Examples:
     * - TryGetString({ a: "Value 1" }, "a") => "Value 1"
     * - TryGetString(["Value 1", "Value 2"], 0) => "Value 1"
     * - TryGetString([{ a: "Value 1"}, { a: "Value 2" }], [1, "a"]) => "Value 2"
     * @param container Container object in which to look for the property/index
     * @param property Property or index (or array of properties/indexes) to find
     * @param defaultValue Default value if property/index is not found or is null or empty
     */
    function TryGetString(container, property, defaultValue) {
        return ParseString(TryGet(container, property, defaultValue), defaultValue);
    }
    Utils.TryGetString = TryGetString;
    /**
     * Try to return a number in a property or index of an object. If found value isn't a number, it will be converted
     * Examples:
     * - TryGetNumber({ a: 1 }, "a") => 1
     * - TryGetNumber([1, 2, 3], 2) => 3
     * - TryGetNumber([{ a: 1}, { a: 2 }], [1, "a"]) => 2
     * @param container Container object in which to look for the property/index
     * @param property Property or index (or array of properties/indexes) to find
     * @param defaultValue Default value if property/index is not found, is null, or can't be converted into a number
     */
    function TryGetNumber(container, property, defaultValue) {
        return ParseNum(TryGet(container, property, defaultValue), defaultValue);
    }
    Utils.TryGetNumber = TryGetNumber;
    /**
     * Try to return a boolean in a property or index of an object. If found value isn't a boolean, it will be converted
     * Examples:
     * - TryGetNumber({ a: true }, "a") => true
     * - TryGetNumber([false, true, false], 2) => false
     * - TryGetNumber([{ a: false}, { a: true }], [1, "a"]) => true
     * @param container Container object in which to look for the property/index
     * @param property Property or index (or array of properties/indexes) to find
     * @param defaultValue Default value if property/index is not found, is null, or can't be converted into a boolean
     */
    function TryGetBool(container, property, defaultValue) {
        return ParseBool(TryGet(container, property, defaultValue), defaultValue);
    }
    Utils.TryGetBool = TryGetBool;
    //#endregion
})(Utils || (Utils = {}));
//# sourceMappingURL=Utils.js.map