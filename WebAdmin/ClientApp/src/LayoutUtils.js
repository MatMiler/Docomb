import { Utils } from "./Data/Utils";
import $ from 'jquery';
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
            ItemKey["WorkspacePageInfo"] = "workspacePageInfo";
            ItemKey["WorkspaceData"] = "workspaceData";
            ItemKey["ContentItemData"] = "contentItemData";
        })(ItemKey = WindowData.ItemKey || (WindowData.ItemKey = {}));
        function get(key) {
            return Utils.tryGet(window, [WindowData.windowProperty, key]);
        }
        WindowData.get = get;
        function set(key, value) {
            if (window[WindowData.windowProperty] == null)
                window[WindowData.windowProperty] = {};
            window[WindowData.windowProperty][key] = value;
        }
        WindowData.set = set;
    })(WindowData = LayoutUtils.WindowData || (LayoutUtils.WindowData = {}));
    function fixLocalLinksInHtml(html, workspace, contentItem) {
        try {
            let container = $("<div />").html(html);
            let readerBasePath = Utils.padWithSlash(Utils.tryGetString(window, "readerBasePath"), false, true);
            readerBasePath = Utils.padWithSlash(readerBasePath = workspace === null || workspace === void 0 ? void 0 : workspace.url, false, true);
            let pageBasePath = Utils.concatUrlPaths(readerBasePath, contentItem === null || contentItem === void 0 ? void 0 : contentItem.url);
            let pageBasePathParts = new Utils.UrlParts(pageBasePath);
            container.find("a").each((index, element) => {
                let a = $(element);
                a.attr("target", "_blank");
                let href = a.attr("href");
                a.attr("href", pageBasePathParts.combineWithPath(href));
            });
            html = container.html();
        }
        catch (e) { }
        return html;
    }
    LayoutUtils.fixLocalLinksInHtml = fixLocalLinksInHtml;
})(LayoutUtils || (LayoutUtils = {}));
//# sourceMappingURL=LayoutUtils.js.map