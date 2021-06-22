import { Utils } from "./Utils";
export var SessionCache;
(function (SessionCache) {
    /** Saved item package (value + metadata) */
    class Item {
        /**
         * Create new item package
         * @param key Key of the stored item
         * @param value Value to save
         * @param expiry Time when the value expires
         */
        constructor(key, value, expiry) {
            this.key = key;
            this.value = value;
            this.expiry = (expiry instanceof Date) ? expiry.getTime() : expiry;
            this.hash = hashCode(value);
            this.timestamp = Date.now();
        }
        /**
         * Parse the item from a serialized string and check its validity
         * @param s String to deserialize
         */
        static deserialize(s) {
            try {
                let data = JSON.parse(s);
                if (data == null)
                    return null;
                let key = Utils.tryGetString(data, "key");
                let value = Utils.tryGet(data, "value");
                let timestamp = Utils.tryGetNumber(data, "value", null);
                let expiry = Utils.tryGetNumber(data, "expiry", null);
                let hash = Utils.tryGetNumber(data, "hash", null);
                if ((expiry != null) && (expiry <= Date.now()))
                    return null; // Expired
                let item = new Item(key, value, expiry);
                item.timestamp = timestamp;
                return (item.hash == hash) ? item : null; // Check hash to see that data hasn't been changed or corrupted
            }
            catch (e) { }
            return null;
        }
        serialize() {
            return JSON.stringify(this);
        }
    }
    SessionCache.Item = Item;
    /** Prefix for keys stored in sessionStorage through this module */
    SessionCache.keyPrefix = "docombCache-";
    /**
     * Retreive a cached item package
     * @param key Key of the stored item
     */
    function getItem(key) {
        if ((key == null) || (key == ""))
            return null; // No key specified
        let s = window.sessionStorage.getItem(SessionCache.keyPrefix + key);
        if ((s == null) || (s == ""))
            return null; // Nothing is saved under this key
        return Item.deserialize(s);
    }
    SessionCache.getItem = getItem;
    /**
     * Check if anything is stored under the given key
     * @param key Key of the stored value
     */
    function has(key) {
        let item = getItem(key);
        return (item != null);
    }
    SessionCache.has = has;
    /**
     * Retreive a cached value
     * @param key Key of the stored item
     */
    function get(key) {
        let item = getItem(key);
        return (item != null) ? item.value : null;
    }
    SessionCache.get = get;
    /**
     * Save value to cache
     * @param key Key of the stored item
     * @param value Value to save
     * @param expiry Time when the value expires
     */
    function save(key, value, expiry = null) {
        if ((key == null) || (key == ""))
            return; // No key specified
        let item = new Item(key, value, expiry);
        window.sessionStorage.setItem(SessionCache.keyPrefix + key, item.serialize());
    }
    SessionCache.save = save;
    function remove(key) {
        window.sessionStorage.removeItem(SessionCache.keyPrefix + key);
    }
    SessionCache.remove = remove;
    /**
     * Generate a hash code from an object
     * @param o Object from which to generate hash code
     */
    function hashCode(o) {
        let s = JSON.stringify(o);
        let hash = 0;
        if (s.length === 0)
            return hash;
        for (let x = 0; x < s.length; x++) {
            hash = ((hash << 5) - hash) + (s.charCodeAt(x));
            hash |= 0;
        }
        return hash;
    }
})(SessionCache || (SessionCache = {}));
//# sourceMappingURL=SessionCache.js.map