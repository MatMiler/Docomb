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
        this.instanceData = {
            treeData: null
        };
        this.navUpdateCall = null;
        let workspaceUrl = Utils.TryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspaceData), "url");
        let selectedKey = Utils.TryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo), ["contentItem", "url"]);
        this.state = { loading: true, lastLoadedTimestamp: LayoutUtils.WindowData.get("workspaceTreeTimestamp-" + encodeURI(workspaceUrl)), currentWorkspaceUrl: workspaceUrl, selectedKey: selectedKey };
    }
    componentDidMount() {
        this.populateContent();
        this.navUpdateCall = this.onNavUpdate.bind(this);
        EventBus.on("navUpdate", this.navUpdateCall);
    }
    componentWillUnmount() {
        EventBus.remove("navUpdate", this.navUpdateCall);
    }
    shouldComponentUpdate(nextProps, nextState) {
        let currentWorkspaceUrl = Utils.TryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspaceData), "url");
        if ((currentWorkspaceUrl != this.state.currentWorkspaceUrl)
            || (this.state.loading != nextState.loading)
            || (this.state.lastLoadedTimestamp != LayoutUtils.WindowData.get("workspaceTreeTimestamp-" + encodeURI(currentWorkspaceUrl)))
            || (this.state.selectedKey != nextState.selectedKey))
            return true;
        return false;
    }
    onNavUpdate() {
        let workspaceUrl = Utils.TryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspaceData), "url");
        let lastLoadedTimestamp = LayoutUtils.WindowData.get("workspaceTreeTimestamp-" + encodeURI(workspaceUrl));
        let selectedKey = Utils.TryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo), ["contentItem", "url"]);
        if ((workspaceUrl != this.state.currentWorkspaceUrl) || (lastLoadedTimestamp != this.state.lastLoadedTimestamp)) {
            this.instanceData.treeData = null;
            this.setState({ loading: true, selectedKey: selectedKey });
            this.populateContent();
        }
        else if (selectedKey != this.state.selectedKey) {
            this.setState({ selectedKey: selectedKey });
        }
    }
    render() {
        let content = null;
        if (this.state.loading) {
            content = React.createElement("div", { className: "loadingSpinner" },
                React.createElement(Spinner, { label: "Loading...", labelPosition: "right", size: SpinnerSize.large }));
        }
        else {
            let selectedKey = this.state.selectedKey;
            if (selectedKey.endsWith("/"))
                selectedKey = selectedKey.slice(0, -1);
            let navLinkGroups = [
                {
                    links: MainNav.itemChildrenToLinks(this.instanceData.treeData, selectedKey)
                }
            ];
            content = React.createElement(Nav, { groups: navLinkGroups, selectedKey: selectedKey, onLinkClick: this.onLinkClick.bind(this) });
        }
        return (React.createElement(Pivot, null,
            React.createElement(PivotItem, { headerText: "Content" }, content),
            React.createElement(PivotItem, { headerText: "Options" }, "Workspace options")));
    }
    static itemChildrenToLinks(items, currentUrl) {
        if (!Utils.ArrayHasValues(items))
            return null;
        let links = [];
        for (let x = 0; x < items.length; x++) {
            let item = items[x];
            let link = this.itemToNavLink(item, currentUrl);
            if (Utils.ArrayHasValues(item.children)) {
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
        let currentUrlTrailed = currentUrl + ((currentUrl.endsWith("/")) ? "" : "/");
        let itemUrlTrailed = item.url + ((item.url.endsWith("/")) ? "" : "/");
        let isExpanded = ((item.url == currentUrl) || (currentUrlTrailed.startsWith(itemUrlTrailed)));
        return {
            name: item.name,
            url: "workspace" + item.localUrl,
            key: (item.url.endsWith("/")) ? item.url.slice(0, -1) : item.url,
            icon: (item.type == Workspaces.ContentItemType.Directory) ? "FolderHorizontal" : "TextDocument",
            isExpanded: isExpanded
        };
    }
    onLinkClick(ev, item) {
        ev.preventDefault();
        Utils.TryGet(this.props, "history").push("/" + item.url);
        EventBus.dispatch("navChange");
    }
    populateContent() {
        return __awaiter(this, void 0, void 0, function* () {
            let workspaceUrl = Utils.TryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspaceData), "url");
            if ((workspaceUrl == null) || (workspaceUrl == ""))
                return;
            let data = yield Workspaces.loadTree(workspaceUrl);
            this.instanceData.treeData = data;
            this.setState({ loading: false, currentWorkspaceUrl: workspaceUrl, lastLoadedTimestamp: LayoutUtils.WindowData.get("workspaceTreeTimestamp-" + encodeURI(workspaceUrl)) });
        });
    }
}
export const MainNavWithRouter = withRouter(MainNav);
//# sourceMappingURL=MainNav.js.map