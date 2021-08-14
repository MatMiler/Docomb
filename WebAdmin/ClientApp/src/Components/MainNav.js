var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { Component } from 'react';
import { Nav, Pivot, PivotItem, Spinner, SpinnerSize } from '@fluentui/react';
import { LayoutUtils } from '../LayoutUtils';
import { Utils } from '../Data/Utils';
import { Workspaces } from '../Data/Workspaces';
import { EventBus } from '../EventBus';
import { withRouter } from "react-router";
export class MainNav extends Component {
    constructor(props) {
        super(props);
        this.navUpdateCall = null;
        this.fileStructChangedCall = null;
        let workspaceUrl = Utils.tryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspaceData), "url");
        let selectedKey = Utils.tryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo), ["contentItem", "url"]);
        this.state = { loading: true, lastLoadedTimestamp: LayoutUtils.WindowData.get("workspaceTreeTimestamp-" + encodeURI(workspaceUrl)), currentWorkspaceUrl: workspaceUrl, selectedKey: selectedKey };
    }
    componentDidMount() {
        MainNavController.prepData(this);
        this.navUpdateCall = this.onNavUpdate.bind(this);
        EventBus.on("navUpdate", this.navUpdateCall);
        this.fileStructChangedCall = this.fileStructChanged.bind(this);
        EventBus.on("fileStructChanged", this.fileStructChangedCall);
    }
    componentWillUnmount() {
        EventBus.remove("navUpdate", this.navUpdateCall);
        EventBus.remove("fileStructChanged", this.fileStructChangedCall);
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (MainNavController.forceRefresh)
            return true;
        let currentWorkspaceUrl = Utils.tryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspaceData), "url");
        if ((currentWorkspaceUrl != this.state.currentWorkspaceUrl)
            || (this.state.loading != nextState.loading)
            || (this.state.lastLoadedTimestamp != LayoutUtils.WindowData.get("workspaceTreeTimestamp-" + encodeURI(currentWorkspaceUrl)))
            || (this.state.selectedKey != nextState.selectedKey))
            return true;
        return false;
    }
    onNavUpdate() {
        let workspaceUrl = Utils.tryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspaceData), "url");
        let lastLoadedTimestamp = LayoutUtils.WindowData.get("workspaceTreeTimestamp-" + encodeURI(workspaceUrl));
        let selectedKey = Utils.tryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo), ["contentItem", "url"]);
        if ((workspaceUrl != this.state.currentWorkspaceUrl) || (lastLoadedTimestamp != this.state.lastLoadedTimestamp)) {
            MainNavController.hasLoaded = false;
            MainNavController.treeData = null;
            this.setState({ loading: true, selectedKey: selectedKey });
            MainNavController.loadData();
        }
        else if (selectedKey != this.state.selectedKey) {
            this.setState({ selectedKey: selectedKey });
        }
    }
    fileStructChanged() {
        MainNavController.forceRefresh = true;
        MainNavController.loadData();
    }
    render() {
        MainNavController.forceRefresh = false;
        return (React.createElement(Pivot, null,
            React.createElement(PivotItem, { headerText: "Content" }, MainNavController.getContent()),
            React.createElement(PivotItem, { headerText: "Options" }, MainNavController.getOptionsContent())));
    }
    static itemChildrenToLinks(items, currentUrl) {
        if (!Utils.arrayHasValues(items))
            return null;
        let links = [];
        for (let x = 0; x < items.length; x++) {
            let item = items[x];
            let link = this.itemToNavLink(item, currentUrl);
            if (Utils.arrayHasValues(item.children)) {
                link.links = this.itemChildrenToLinks(item.children, currentUrl);
                link.icon = null;
            }
            links.push(link);
        }
        return links;
    }
    static itemToNavLink(item, currentUrl) {
        if (item == null)
            return null;
        let currentUrlTrailed = Utils.padWithSlash(currentUrl, false, true);
        let itemUrlTrailed = Utils.padWithSlash(item.url, false, true);
        let isExpanded = ((item.url == currentUrl) || (currentUrlTrailed.startsWith(itemUrlTrailed)));
        let icon = (item.type == Workspaces.ContentItemType.Directory) ? "FolderFill" : "Page";
        if (item.type == Workspaces.ContentItemType.File) {
            let extension = Utils.lastStringPart(item.name, ".");
            if ((extension === null || extension === void 0 ? void 0 : extension.length) > 0) {
                switch (extension.toLowerCase()) {
                    case "md":
                    case "markdown":
                    case "mdown":
                    case "mkdn":
                    case "mkd":
                    case "mdwn":
                    case "text": {
                        icon = "MarkDownLanguage";
                        break;
                    }
                    case "txt": {
                        icon = "TextDocument";
                        break;
                    }
                    case "js":
                    case "json": {
                        icon = "JavaScriptLanguage";
                        break;
                    }
                    case "jpeg":
                    case "png":
                    case "bmp":
                    case "jpg":
                    case "tiff":
                    case "gif": {
                        icon = "Photo2";
                        break;
                    }
                }
            }
        }
        return {
            name: item.name,
            url: "workspace" + item.reactLocalUrl,
            key: (item.url.endsWith("/")) ? item.url.slice(0, -1) : item.url,
            icon: icon,
            isExpanded: isExpanded
        };
    }
}
export const MainNavWithRouter = withRouter(MainNav);
var MainNavController;
(function (MainNavController) {
    let instance = null;
    MainNavController.treeData = null;
    MainNavController.forceRefresh = false;
    MainNavController.hasLoaded = false;
    MainNavController.workspace = null;
    function prepData(navInstance) {
        instance = navInstance;
        loadData();
    }
    MainNavController.prepData = prepData;
    function getContent() {
        if (MainNavController.hasLoaded != true) {
            return (React.createElement("div", { className: "loadingSpinner" },
                React.createElement(Spinner, { label: "Loading...", labelPosition: "right", size: SpinnerSize.large })));
        }
        let selectedKey = instance.state.selectedKey;
        if (selectedKey.endsWith("/"))
            selectedKey = selectedKey.slice(0, -1);
        let links = MainNav.itemChildrenToLinks(MainNavController.treeData, selectedKey);
        if (links != null)
            links.reverse();
        else
            links = [];
        links.push({ name: "/", url: "workspace" + MainNavController.workspace.reactLocalUrl, key: "/", icon: "HomeSolid", isExpanded: false });
        if (links.length > 1)
            links.reverse();
        let navLinkGroups = [
            {
                links: links
            }
        ];
        return (React.createElement(Nav, { groups: navLinkGroups, selectedKey: selectedKey, onLinkClick: onLinkClick }));
    }
    MainNavController.getContent = getContent;
    function getOptionsContent() {
        var _a;
        if (MainNavController.hasLoaded != true) {
            return (React.createElement("div", { className: "loadingSpinner" },
                React.createElement(Spinner, { label: "Loading...", labelPosition: "right", size: SpinnerSize.large })));
        }
        let selectedKey = instance.state.selectedKey;
        if (selectedKey.endsWith("/"))
            selectedKey = selectedKey.slice(0, -1);
        let groups = [];
        if (((_a = MainNavController.workspace === null || MainNavController.workspace === void 0 ? void 0 : MainNavController.workspace.storage) === null || _a === void 0 ? void 0 : _a.hasGit) == true) {
            groups.push({
                name: "Storage",
                links: [
                    { name: "Git repository", key: "_options/git", url: "workspace" + (MainNavController.workspace === null || MainNavController.workspace === void 0 ? void 0 : MainNavController.workspace.reactLocalUrl) + "?options=git", icon: "GitGraph" }
                ]
            });
        }
        return (React.createElement(Nav, { groups: groups, selectedKey: selectedKey, onLinkClick: onLinkClick }));
    }
    MainNavController.getOptionsContent = getOptionsContent;
    function onLinkClick(ev, item) {
        ev.preventDefault();
        Utils.tryGet(instance.props, "history").push(Utils.padWithSlash(item.url, true, false));
        EventBus.dispatch("navChange");
    }
    MainNavController.onLinkClick = onLinkClick;
    function loadData() {
        return __awaiter(this, void 0, void 0, function* () {
            MainNavController.hasLoaded = false;
            MainNavController.workspace = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspaceData);
            let workspaceUrl = MainNavController.workspace === null || MainNavController.workspace === void 0 ? void 0 : MainNavController.workspace.url;
            if ((workspaceUrl == null) || (workspaceUrl == ""))
                return;
            MainNavController.treeData = yield Workspaces.loadTree(workspaceUrl);
            MainNavController.hasLoaded = true;
            instance.setState({ loading: false, currentWorkspaceUrl: workspaceUrl, lastLoadedTimestamp: LayoutUtils.WindowData.get("workspaceTreeTimestamp-" + encodeURI(workspaceUrl)) });
        });
    }
    MainNavController.loadData = loadData;
})(MainNavController || (MainNavController = {}));
//# sourceMappingURL=MainNav.js.map