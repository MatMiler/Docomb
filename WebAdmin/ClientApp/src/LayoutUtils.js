import { Utils } from "./Data/Utils";
export var LayoutUtils;
(function (LayoutUtils) {
    let NavBar;
    (function (NavBar) {
        let ItemKey;
        (function (ItemKey) {
            ItemKey["Home"] = "home";
            ItemKey["Settings"] = "settings";
        })(ItemKey = NavBar.ItemKey || (NavBar.ItemKey = {}));
        function updateNavBar() {
            this.setState();
        }
        NavBar.updateNavBar = updateNavBar;
    })(NavBar = LayoutUtils.NavBar || (LayoutUtils.NavBar = {}));
    let WindowData;
    (function (WindowData) {
        WindowData.windowProperty = "docombProp";
        let ItemKey;
        (function (ItemKey) {
            ItemKey["SelectedSideBarItem"] = "selectedSideBarItem";
        })(ItemKey = WindowData.ItemKey || (WindowData.ItemKey = {}));
        function get(key) {
            return Utils.TryGetString(window, [WindowData.windowProperty, key]);
        }
        WindowData.get = get;
        function set(key, value) {
            if (window[WindowData.windowProperty] == null)
                window[WindowData.windowProperty] = {};
            window[WindowData.windowProperty][key] = value;
        }
        WindowData.set = set;
    })(WindowData = LayoutUtils.WindowData || (LayoutUtils.WindowData = {}));
})(LayoutUtils || (LayoutUtils = {}));
//# sourceMappingURL=LayoutUtils.js.map