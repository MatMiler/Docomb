var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CommandBar, ContextualMenuItemType, DefaultButton, Dialog, DialogFooter, DialogType, FontIcon, mergeStyles, PrimaryButton, Spinner, SpinnerSize, Stack, TextField } from '@fluentui/react';
import React, { useState } from 'react';
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
    const [waitingIsVisible, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting }] = useBoolean(false);
    const [alertIsVisible, { toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert }] = useBoolean(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertContent, setAlertContent] = useState("");
    const [renameIsVisible, { toggle: toggleRename, setTrue: showRename, setFalse: hideRename }] = useBoolean(false);
    const [moveIsVisible, { toggle: toggleMove, setTrue: showMove, setFalse: hideMove }] = useBoolean(false);
    ContentDirectoryController.prepData(navigate, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting }, { toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert, setTitle: setAlertTitle, setContent: setAlertContent }, { toggle: toggleRename, setTrue: showRename, setFalse: hideRename }, { toggle: toggleMove, setTrue: showMove, setFalse: hideMove });
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
        React.createElement(Dialog, { hidden: !waitingIsVisible, dialogContentProps: { type: DialogType.normal, title: null, showCloseButton: false }, modalProps: { isBlocking: true } },
            React.createElement(DialogFooter, null,
                React.createElement(Spinner, { label: "Please wait...", labelPosition: "right", size: SpinnerSize.large }))),
        React.createElement(Dialog, { hidden: !alertIsVisible, dialogContentProps: { type: DialogType.largeHeader, title: alertTitle }, modalProps: { isBlocking: false }, onDismiss: hideAlert },
            React.createElement(Stack, { horizontal: true, verticalAlign: "center" },
                React.createElement(FontIcon, { iconName: "Warning", className: mergeStyles({ fontSize: 30, width: 30, height: 36, lineHeight: 36, margin: "0 16px 0 0" }) }),
                React.createElement("div", null, alertContent)),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: hideAlert, text: "OK" }))),
        React.createElement(Dialog, { hidden: !renameIsVisible, onDismiss: hideRename, dialogContentProps: renameDialogContent, modalProps: renameDialogModal },
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
    let waitingDialogCallbacks = null;
    let alertDialogCallbacks = null;
    let renameDialogCallbacks = null;
    let moveDialogCallbacks = null;
    function prepData(navigate, waitingDialog, alertDialog, renameDialog, moveDialog) {
        let newPageInfo = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo);
        ContentDirectoryController.pageInfo = newPageInfo;
        // UI & React callbacks
        navigateCallback = navigate;
        waitingDialogCallbacks = waitingDialog;
        alertDialogCallbacks = alertDialog;
        renameDialogCallbacks = renameDialog;
        moveDialogCallbacks = moveDialog;
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
            renameDialogCallbacks.setTrue();
        }
        Rename.show = show;
        function finish() {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                let fileName = Utils.trimString($("#renameInput", "").val());
                renameDialogCallbacks.setFalse();
                waitingDialogCallbacks.setTrue();
                let response = yield Workspaces.renameDirectory((_a = ContentDirectoryController.pageInfo === null || ContentDirectoryController.pageInfo === void 0 ? void 0 : ContentDirectoryController.pageInfo.contentItem) === null || _a === void 0 ? void 0 : _a.reactLocalUrl, fileName);
                waitingDialogCallbacks.setFalse();
                if (((_b = response === null || response === void 0 ? void 0 : response.actionStatus) === null || _b === void 0 ? void 0 : _b.isOk) == true) {
                    let newUrl = Utils.trimString(response === null || response === void 0 ? void 0 : response.newUrl, "");
                    if (!newUrl.startsWith("/"))
                        newUrl = "/" + newUrl;
                    Workspaces.clearTreeCache();
                    EventBus.dispatch("fileStructChanged");
                    navigateCallback("/workspace" + newUrl);
                }
                else {
                    let title = "Can't rename folder";
                    let desc = response.actionStatus.getDialogMessage();
                    alertDialogCallbacks.setTrue();
                    alertDialogCallbacks.setTitle(title);
                    alertDialogCallbacks.setContent(desc);
                }
            });
        }
        Rename.finish = finish;
        function cancel() {
            renameDialogCallbacks.setFalse();
        }
        Rename.cancel = cancel;
    })(Rename = ContentDirectoryController.Rename || (ContentDirectoryController.Rename = {}));
    let Move;
    (function (Move) {
        function show() {
            moveDialogCallbacks.setTrue();
        }
        Move.show = show;
        function finish() {
            moveDialogCallbacks.setFalse();
        }
        Move.finish = finish;
        function cancel() {
            moveDialogCallbacks.setFalse();
        }
        Move.cancel = cancel;
    })(Move = ContentDirectoryController.Move || (ContentDirectoryController.Move = {}));
})(ContentDirectoryController || (ContentDirectoryController = {}));
//# sourceMappingURL=ContentDirectory.js.map