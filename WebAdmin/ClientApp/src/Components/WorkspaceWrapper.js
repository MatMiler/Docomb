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
import ContentDirectory from './Workspace/ContentDirectory';
import ContentFileInfo from './Workspace/ContentFileInfo';
import EditTextFile from './Workspace/EditTextFile';
import { NotFound } from './NotFound';
import GitManager from './Workspace/GitManager';
export class WorkspaceWrapper extends Component {
    constructor(props) {
        super(props);
        this.onLocationChangeCall = null;
        this.state = { hash: null };
    }
    componentDidMount() {
        WorkspaceWrapperController.prep(this);
        this.onLocationChangeCall = this.onLocationChange.bind(this);
        EventBus.on(WorkspaceWrapperController.locationChangeEventName, this.onLocationChangeCall);
    }
    componentWillUnmount() {
        EventBus.remove(WorkspaceWrapperController.locationChangeEventName, this.onLocationChangeCall);
    }
    componentDidUpdate(prevProps, prevState) {
        WorkspaceWrapperController.onComponentUpdate();
    }
    onLocationChange() {
        this.setState({ hash: WorkspaceWrapperController.stateHash });
    }
    render() {
        return (React.createElement(Layout, { mainNavType: "workspace" }, WorkspaceWrapperController.getContent()));
    }
}
var WorkspaceWrapperController;
(function (WorkspaceWrapperController) {
    WorkspaceWrapperController.locationChangeEventName = "workspaceWrapper-locationChange";
    WorkspaceWrapperController.requestedPath = null;
    WorkspaceWrapperController.requestedQuery = null;
    WorkspaceWrapperController.isLoading = true;
    WorkspaceWrapperController.selectedSideBarItem = null;
    WorkspaceWrapperController.workspace = null;
    WorkspaceWrapperController.pageInfo = null;
    WorkspaceWrapperController.instance = null;
    WorkspaceWrapperController.stateHash = null;
    function prep(componentInstance) {
        WorkspaceWrapperController.instance = componentInstance;
        WorkspaceWrapperController.instance["test"] = Utils.tryGet(WorkspaceWrapperController.instance, "test", Math.random());
        LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, null);
        LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspaceData, null);
        LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo, null);
        loadData();
    }
    WorkspaceWrapperController.prep = prep;
    function loadData() {
        return __awaiter(this, void 0, void 0, function* () {
            WorkspaceWrapperController.requestedPath = getInstancePath();
            WorkspaceWrapperController.requestedQuery = getInstanceQuery();
            WorkspaceWrapperController.workspace = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspaceData);
            LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspaceData, null);
            WorkspaceWrapperController.isLoading = true;
            let data = yield Workspaces.loadPageInfo(WorkspaceWrapperController.requestedPath, WorkspaceWrapperController.requestedQuery);
            WorkspaceWrapperController.pageInfo = data;
            WorkspaceWrapperController.workspace = data === null || data === void 0 ? void 0 : data.workspace;
            WorkspaceWrapperController.selectedSideBarItem = WorkspaceWrapperController.workspace === null || WorkspaceWrapperController.workspace === void 0 ? void 0 : WorkspaceWrapperController.workspace.url;
            LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, WorkspaceWrapperController.selectedSideBarItem);
            LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspaceData, WorkspaceWrapperController.workspace);
            LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo, WorkspaceWrapperController.pageInfo);
            WorkspaceWrapperController.isLoading = false;
            WorkspaceWrapperController.stateHash = getStateHash();
            EventBus.dispatch(WorkspaceWrapperController.locationChangeEventName);
            EventBus.dispatch("navUpdate");
        });
    }
    WorkspaceWrapperController.loadData = loadData;
    function getStateHash(path, query) {
        if (path === undefined)
            path = WorkspaceWrapperController.requestedPath;
        if (query === undefined)
            query = WorkspaceWrapperController.requestedQuery;
        return path + "|" + query;
    }
    WorkspaceWrapperController.getStateHash = getStateHash;
    function getInstancePath() { return Utils.tryGetString(WorkspaceWrapperController.instance, ["props", "match", "params", "itemPath"]); }
    WorkspaceWrapperController.getInstancePath = getInstancePath;
    function getInstanceQuery() { return Utils.tryGetString(WorkspaceWrapperController.instance, ["props", "location", "search"]); }
    WorkspaceWrapperController.getInstanceQuery = getInstanceQuery;
    function onComponentUpdate() {
        let newHash = getStateHash(getInstancePath(), getInstanceQuery());
        if (newHash != WorkspaceWrapperController.stateHash) {
            loadData();
        }
    }
    WorkspaceWrapperController.onComponentUpdate = onComponentUpdate;
    function getContent() {
        var _a, _b, _c, _d;
        if (WorkspaceWrapperController.isLoading)
            return null;
        let query = Utils.breakUrlParams(WorkspaceWrapperController.requestedQuery);
        let optionsCode = Utils.tryGetString(query, "options");
        if (optionsCode != null) {
            switch (optionsCode) {
                case "git": return (React.createElement(GitManager, null));
            }
        }
        if (((_a = WorkspaceWrapperController.pageInfo === null || WorkspaceWrapperController.pageInfo === void 0 ? void 0 : WorkspaceWrapperController.pageInfo.contentItem) === null || _a === void 0 ? void 0 : _a.type) == Workspaces.ContentItemType.Directory) {
            return (React.createElement(ContentDirectory, null));
        }
        if (((_b = WorkspaceWrapperController.pageInfo === null || WorkspaceWrapperController.pageInfo === void 0 ? void 0 : WorkspaceWrapperController.pageInfo.contentItem) === null || _b === void 0 ? void 0 : _b.type) == Workspaces.ContentItemType.File) {
            if (WorkspaceWrapperController.pageInfo.action == Workspaces.ContentItemAction.Edit) {
                switch ((_d = (_c = WorkspaceWrapperController.pageInfo) === null || _c === void 0 ? void 0 : _c.details) === null || _d === void 0 ? void 0 : _d.type) {
                    case Workspaces.FileType.Markdown:
                    case Workspaces.FileType.Html:
                    case Workspaces.FileType.PlainText:
                        {
                            return (React.createElement(EditTextFile, null));
                        }
                }
            }
            return (React.createElement(ContentFileInfo, null));
        }
        return (React.createElement(NotFound, null));
    }
    WorkspaceWrapperController.getContent = getContent;
})(WorkspaceWrapperController || (WorkspaceWrapperController = {}));
//# sourceMappingURL=WorkspaceWrapper.js.map