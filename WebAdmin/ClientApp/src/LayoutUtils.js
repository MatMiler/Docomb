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
            ItemKey["WorkspacePageInfo"] = "workspacePageInfo";
            ItemKey["WorkspaceData"] = "workspaceData";
            ItemKey["ContentItemData"] = "contentItemData";
        })(ItemKey = WindowData.ItemKey || (WindowData.ItemKey = {}));
        function get(key) {
            return Utils.TryGet(window, [WindowData.windowProperty, key]);
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
            let readerBasePath = Utils.TryGetString(window, "readerBasePath");
            if (!readerBasePath.endsWith("/"))
                readerBasePath += "/";
            readerBasePath += workspace === null || workspace === void 0 ? void 0 : workspace.url;
            if (!readerBasePath.endsWith("/"))
                readerBasePath += "/";
            container.find("a").each((index, element) => {
                let a = $(element);
                a.attr("target", "_blank");
                let href = a.attr("href");
                if (Utils.TrimString(href, null) != null) {
                    let slashPos = href.indexOf("/");
                    if (slashPos == 0)
                        return;
                    let hashPos = href.indexOf("#");
                    let doubleSlashPos = href.indexOf("//");
                    let paramPos = href.indexOf("?");
                    if (hashPos < 0)
                        hashPos = href.length;
                    if (doubleSlashPos < 0)
                        doubleSlashPos = href.length;
                    if (paramPos < 0)
                        paramPos = href.length;
                    if ((doubleSlashPos >= hashPos) && (doubleSlashPos >= paramPos)) {
                        href = readerBasePath + href;
                        a.attr("href", href);
                    }
                }
            });
            html = container.html();
        }
        catch (e) { }
        return html;
    }
    LayoutUtils.fixLocalLinksInHtml = fixLocalLinksInHtml;
})(LayoutUtils || (LayoutUtils = {}));
//# sourceMappingURL=LayoutUtils.js.map