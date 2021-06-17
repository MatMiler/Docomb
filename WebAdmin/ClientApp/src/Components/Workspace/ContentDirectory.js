var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CommandBar, ContextualMenuItemType, DefaultButton, Dialog, DialogFooter, DialogType, FontIcon, PrimaryButton, TextField } from '@fluentui/react';
import React from 'react';
import { useHistory } from "react-router-dom";
import { useBoolean } from '@fluentui/react-hooks';
import { Utils } from '../../Data/Utils';
import { Workspaces } from '../../Data/Workspaces';
import { LayoutUtils } from '../../LayoutUtils';
import PageBreadcrumbs from './PageBreadcrumbs';
import $ from 'jquery';
import { EventBus } from '../../EventBus';
const ContentDirectory = () => {
    var _a, _b;
    const history = useHistory();
    function navigate(url) { history.push(url); }
    const [showRenameDialog, { toggle: toggleRenameDialog }] = useBoolean(false);
    const [showMoveDialog, { toggle: toggleMoveDialog }] = useBoolean(false);
    ContentDirectoryController.prepData(navigate, toggleRenameDialog, toggleMoveDialog);
    let renameDialogContent = {
        type: DialogType.largeHeader,
        title: "Rename folder"
    };
    let renameDialogModal = { isBlocking: false };
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "pageGrid" },
            React.createElement("div", { className: "pageTitle" },
                React.createElement(PageBreadcrumbs, null)),
            ContentDirectoryController.getToolbar(),
            React.createElement("div", { className: "pageContent" },
                React.createElement("div", { className: "emptyPage" },
                    React.createElement("div", { className: "watermark" },
                        React.createElement(FontIcon, { iconName: ContentDirectoryController.isRoot ? "ProjectCollection" : "OpenFolderHorizontal" }))))),
        React.createElement(Dialog, { hidden: !showRenameDialog, onDismiss: toggleRenameDialog, dialogContentProps: renameDialogContent, modalProps: renameDialogModal },
            React.createElement(TextField, { label: "New folder name", id: "renameInput", defaultValue: (_b = (_a = ContentDirectoryController === null || ContentDirectoryController === void 0 ? void 0 : ContentDirectoryController.pageInfo) === null || _a === void 0 ? void 0 : _a.contentItem) === null || _b === void 0 ? void 0 : _b.name }),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: ContentDirectoryController.Rename.finish, text: "Rename" }),
                React.createElement(DefaultButton, { onClick: ContentDirectoryController.Rename.cancel, text: "Cancel" })))));
};
export default ContentDirectory;
var ContentDirectoryController;
(function (ContentDirectoryController) {
    ContentDirectoryController.pageInfo = null;
    ContentDirectoryController.isRoot = false;
    let navigateCallback = null;
    let toggleRenameDialogCallback = null;
    let toggleMoveDialogCallback = null;
    function prepData(navigate, toggleRenameDialog, toggleMoveDialog) {
        let newPageInfo = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo);
        ContentDirectoryController.pageInfo = newPageInfo;
        navigateCallback = navigate;
        toggleRenameDialogCallback = toggleRenameDialog;
        toggleMoveDialogCallback = toggleMoveDialog;
        let directoryUrl = Utils.tryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo), ["contentItem", "url"]);
        if (!directoryUrl.startsWith("/"))
            directoryUrl = "/" + directoryUrl;
        if (!directoryUrl.endsWith("/"))
            directoryUrl += "/";
        ContentDirectoryController.isRoot = (directoryUrl == "/");
    }
    ContentDirectoryController.prepData = prepData;
    function getToolbar() {
        let commandBarItems = [
            {
                key: "newItem", text: "New", disabled: true, iconProps: { iconName: "Add" },
                subMenuProps: {
                    items: [
                        { key: "newMarkdown", text: "Markdown file", iconProps: { iconName: "MarkDownLanguage" } },
                        { key: "newText", text: "Text file", iconProps: { iconName: "TextDocument" } },
                        { key: 'divider', name: '-', itemType: ContextualMenuItemType.Divider },
                        { key: "newDirectory", text: "Folder", iconProps: { iconName: "FolderHorizontal" } }
                    ]
                }
            },
            { key: "upload", text: "Upload", disabled: true, iconProps: { iconName: "Upload" } }
        ];
        if (!ContentDirectoryController.isRoot) {
            commandBarItems.push({ key: "rename", text: "Rename", onClick: Rename.show, iconProps: { iconName: "Rename" } });
            commandBarItems.push({ key: "move", text: "Move", disabled: true, iconProps: { iconName: "MoveToFolder" } });
            commandBarItems.push({ key: "delete", text: "Delete", disabled: true, iconProps: { iconName: "Delete" } });
        }
        return (React.createElement("div", { className: "pageCommands" },
            React.createElement(CommandBar, { items: commandBarItems })));
    }
    ContentDirectoryController.getToolbar = getToolbar;
    let Rename;
    (function (Rename) {
        function show() {
            toggleRenameDialogCallback();
        }
        Rename.show = show;
        function finish() {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                let fileName = Utils.trimString($("#renameInput", "").val());
                toggleRenameDialogCallback();
                let response = yield Workspaces.renameDirectory((_a = ContentDirectoryController.pageInfo === null || ContentDirectoryController.pageInfo === void 0 ? void 0 : ContentDirectoryController.pageInfo.contentItem) === null || _a === void 0 ? void 0 : _a.reactLocalUrl, fileName);
                if ((response === null || response === void 0 ? void 0 : response.success) == true) {
                    let newUrl = Utils.trimString(response === null || response === void 0 ? void 0 : response.newUrl, "");
                    if (!newUrl.startsWith("/"))
                        newUrl = "/" + newUrl;
                    Workspaces.clearTreeCache();
                    EventBus.dispatch("fileStructChanged");
                    navigateCallback("/workspace" + newUrl);
                }
            });
        }
        Rename.finish = finish;
        function cancel() {
            toggleRenameDialogCallback();
        }
        Rename.cancel = cancel;
    })(Rename = ContentDirectoryController.Rename || (ContentDirectoryController.Rename = {}));
    let Move;
    (function (Move) {
        function show() {
            toggleMoveDialogCallback();
        }
        Move.show = show;
        function finish() {
            toggleMoveDialogCallback();
        }
        Move.finish = finish;
        function cancel() {
            toggleMoveDialogCallback();
        }
        Move.cancel = cancel;
    })(Move = ContentDirectoryController.Move || (ContentDirectoryController.Move = {}));
})(ContentDirectoryController || (ContentDirectoryController = {}));
//# sourceMappingURL=ContentDirectory.js.map