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
import { Layout } from './Layout';
import { Utils } from '../Data/Utils';
import { Workspaces } from '../Data/Workspaces';
import { LayoutUtils } from '../LayoutUtils';
import { EventBus } from '../EventBus';
import Home from './Workspace/Home';
import ContentDirectory from './Workspace/ContentDirectory';
import ContentFileInfo from './Workspace/ContentFileInfo';
import EditTextFile from './Workspace/EditTextFile';
export class WorkspaceWrapper extends Component {
    constructor(props) {
        super(props);
        this.navCall = null;
        this.state = { pageInfo: null, loading: true };
    }
    componentDidMount() {
        LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspaceData, null);
        this.populateInfo();
        this.navCall = this.onNav.bind(this);
        EventBus.on("navChange", this.navCall);
    }
    componentWillUnmount() {
        EventBus.remove("navChange", this.navCall);
    }
    componentDidUpdate(prevProps, prevState) {
        let prevLocation = Utils.TryGetString(prevProps, ["location", "pathname"]);
        let currentLocation = Utils.TryGetString(this.props, ["location", "pathname"]);
        let prevSearch = Utils.TryGetString(prevProps, ["location", "search"]);
        let currentSearch = Utils.TryGetString(this.props, ["location", "search"]);
        if ((prevLocation != currentLocation) || (prevSearch != currentSearch)) {
            LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspaceData, null);
            this.populateInfo();
        }
    }
    onNav() {
    }
    render() {
        var _a, _b, _c;
        let content = null;
        if (this.state.loading == false) {
            if (Utils.TrimString((_a = this.state.pageInfo.contentItem) === null || _a === void 0 ? void 0 : _a.url, null) == null) {
                content = React.createElement(Home, null);
            }
            else if (this.state.pageInfo.contentItem.type == Workspaces.ContentItemType.Directory) {
                content = React.createElement(ContentDirectory, null);
            }
            else {
                if (this.state.pageInfo.action == Workspaces.ContentItemAction.Edit) {
                    switch ((_c = (_b = this.state.pageInfo) === null || _b === void 0 ? void 0 : _b.details) === null || _c === void 0 ? void 0 : _c.type) {
                        case Workspaces.FileType.Markdown:
                        case Workspaces.FileType.Html:
                        case Workspaces.FileType.PlainText:
                            {
                                content = React.createElement(EditTextFile, null);
                                break;
                            }
                        default:
                            {
                                content = React.createElement(ContentFileInfo, null);
                                break;
                            }
                    }
                }
                else {
                    content = React.createElement(ContentFileInfo, null);
                }
            }
        }
        return (React.createElement(Layout, { showMainNav: true }, content));
    }
    populateInfo() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield Workspaces.loadPageInfo(Utils.TryGetString(this.props, ["match", "params", "itemPath"]), Utils.TryGetString(this.props, ["location", "search"]));
            LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, (_a = data === null || data === void 0 ? void 0 : data.workspace) === null || _a === void 0 ? void 0 : _a.url);
            LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspaceData, data === null || data === void 0 ? void 0 : data.workspace);
            LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo, data);
            this.setState({ pageInfo: data, loading: false });
            EventBus.dispatch("navUpdate");
        });
    }
}
//# sourceMappingURL=WorkspaceWrapper.js.map