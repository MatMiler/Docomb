var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CommandBar, DefaultButton, Dialog, DialogFooter, DialogType, FontIcon, mergeStyles, PrimaryButton, Spinner, SpinnerSize, Stack, TextField } from '@fluentui/react';
import React, { useState } from 'react';
import { useHistory } from "react-router-dom";
import { useBoolean } from '@fluentui/react-hooks';
import { Utils } from '../../Data/Utils';
import { Workspaces } from '../../Data/Workspaces';
import { LayoutUtils } from '../../LayoutUtils';
import PageBreadcrumbs from './PageBreadcrumbs';
import $ from 'jquery';
import { EventBus } from '../../EventBus';
const ContentFileInfo = () => {
    var _a;
    const history = useHistory();
    function navigate(url) { history.push(url); }
    const [waitingIsVisible, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting }] = useBoolean(false);
    const [alertIsVisible, { toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert }] = useBoolean(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertContent, setAlertContent] = useState("");
    const [renameIsVisible, { toggle: toggleRename, setTrue: showRename, setFalse: hideRename }] = useBoolean(false);
    const [moveIsVisible, { toggle: toggleMove, setTrue: showMove, setFalse: hideMove }] = useBoolean(false);
    ContentFileInfoController.prepData(navigate, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting }, { toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert, setTitle: setAlertTitle, setContent: setAlertContent }, { toggle: toggleRename, setTrue: showRename, setFalse: hideRename }, { toggle: toggleMove, setTrue: showMove, setFalse: hideMove });
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "pageGrid" },
            React.createElement("div", { className: "pageTitle" },
                React.createElement(PageBreadcrumbs, null)),
            ContentFileInfoController.getToolbar(),
            React.createElement("div", { className: "pageContent" }, ContentFileInfoController.getContentPanel())),
        React.createElement(Dialog, { hidden: !waitingIsVisible, dialogContentProps: { type: DialogType.normal, title: null, showCloseButton: false }, modalProps: { isBlocking: true } },
            React.createElement(DialogFooter, null,
                React.createElement(Spinner, { label: "Please wait...", labelPosition: "right", size: SpinnerSize.large }))),
        React.createElement(Dialog, { hidden: !alertIsVisible, dialogContentProps: { type: DialogType.largeHeader, title: alertTitle }, modalProps: { isBlocking: false }, onDismiss: hideAlert },
            React.createElement(Stack, { horizontal: true, verticalAlign: "center" },
                React.createElement(FontIcon, { iconName: "Warning", className: mergeStyles({ fontSize: 30, width: 30, height: 36, lineHeight: 36, margin: "0 16px 0 0" }) }),
                React.createElement("div", null, alertContent)),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: hideAlert, text: "OK" }))),
        React.createElement(Dialog, { hidden: !renameIsVisible, onDismiss: hideRename, dialogContentProps: { type: DialogType.largeHeader, title: "Rename file" }, modalProps: { isBlocking: false } },
            React.createElement(TextField, { label: "New file name", id: "renameInput", defaultValue: (_a = ContentFileInfoController === null || ContentFileInfoController === void 0 ? void 0 : ContentFileInfoController.fileDetails) === null || _a === void 0 ? void 0 : _a.fileName }),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: ContentFileInfoController.Rename.finish, text: "Rename" }),
                React.createElement(DefaultButton, { onClick: ContentFileInfoController.Rename.cancel, text: "Cancel" })))));
};
export default ContentFileInfo;
var ContentFileInfoController;
(function (ContentFileInfoController) {
    ContentFileInfoController.pageInfo = null;
    ContentFileInfoController.fileDetails = null;
    let navigateCallback = null;
    let waitingDialogCallbacks = null;
    let alertDialogCallbacks = null;
    let renameDialogCallbacks = null;
    let moveDialogCallbacks = null;
    function prepData(navigate, waitingDialog, alertDialog, renameDialog, moveDialog) {
        let newPageInfo = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo);
        ContentFileInfoController.pageInfo = newPageInfo;
        ContentFileInfoController.fileDetails = ContentFileInfoController.pageInfo === null || ContentFileInfoController.pageInfo === void 0 ? void 0 : ContentFileInfoController.pageInfo.details;
        // UI & React callbacks
        navigateCallback = navigate;
        waitingDialogCallbacks = waitingDialog;
        alertDialogCallbacks = alertDialog;
        renameDialogCallbacks = renameDialog;
        moveDialogCallbacks = moveDialog;
    }
    ContentFileInfoController.prepData = prepData;
    function getToolbar() {
        let commandBarItems = [];
        let hasRaw = false;
        switch (ContentFileInfoController.fileDetails === null || ContentFileInfoController.fileDetails === void 0 ? void 0 : ContentFileInfoController.fileDetails.type) {
            case Workspaces.FileType.Markdown: // { commandBarItems.push({ key: "editMarkdown", text: "Edit", onClick: gotoEditor, iconProps: { iconName: "Edit" } }); hasRaw = true; break; }
            case Workspaces.FileType.Html: // { commandBarItems.push({ key: "editHtml", text: "Edit", onClick: gotoEditor, iconProps: { iconName: "Edit" } }); hasRaw = true; break; }
            case Workspaces.FileType.PlainText: // { commandBarItems.push({ key: "editPlainText", text: "Edit", onClick: gotoEditor, iconProps: { iconName: "Edit" } }); hasRaw = true; break; }
                {
                    commandBarItems.push({ key: "editPlainText", text: "Edit", onClick: gotoEditor, iconProps: { iconName: "Edit" } });
                    hasRaw = true;
                    break;
                }
        }
        commandBarItems.push({ key: "rename", text: "Rename", onClick: Rename.show, iconProps: { iconName: "Rename" } });
        commandBarItems.push({ key: "move", text: "Move", disabled: true, iconProps: { iconName: "MoveToFolder" } });
        commandBarItems.push({ key: "delete", text: "Delete", disabled: true, iconProps: { iconName: "Delete" } });
        let farItems = [
            { key: "toggleInfo", text: "Toggle file information", iconOnly: true, ariaLabel: "Toggle file information", iconProps: { iconName: "Info" }, onClick: toggleMetaDataPanel }
        ];
        return (React.createElement("div", { className: "pageCommands" },
            React.createElement(CommandBar, { items: commandBarItems, farItems: farItems })));
    }
    ContentFileInfoController.getToolbar = getToolbar;
    function gotoEditor() {
        if (navigateCallback != null)
            navigateCallback("/workspace" + (ContentFileInfoController.fileDetails === null || ContentFileInfoController.fileDetails === void 0 ? void 0 : ContentFileInfoController.fileDetails.reactLocalUrl) + "?action=edit");
    }
    function getContentPanel() {
        switch (ContentFileInfoController.fileDetails === null || ContentFileInfoController.fileDetails === void 0 ? void 0 : ContentFileInfoController.fileDetails.type) {
            case Workspaces.FileType.Markdown: {
                return (React.createElement("div", { className: "contentFileDetails" },
                    React.createElement("div", { className: "articleContent", dangerouslySetInnerHTML: { __html: LayoutUtils.fixLocalLinksInHtml(ContentFileInfoController.fileDetails.contentHtml, ContentFileInfoController.pageInfo === null || ContentFileInfoController.pageInfo === void 0 ? void 0 : ContentFileInfoController.pageInfo.workspace, ContentFileInfoController.pageInfo === null || ContentFileInfoController.pageInfo === void 0 ? void 0 : ContentFileInfoController.pageInfo.contentItem) } }),
                    getFileMetaDataPanel()));
            }
            case Workspaces.FileType.PlainText: {
                return (React.createElement("div", { className: "contentFileDetails" },
                    React.createElement("div", { className: "articleContent" },
                        React.createElement("pre", { className: "plainTextFile" }, ContentFileInfoController.fileDetails.contentText)),
                    getFileMetaDataPanel()));
            }
        }
        return (React.createElement("div", { className: "contentFileDetails" },
            React.createElement("div", { className: "articleContent" }, "Preview is not supported for this file type"),
            getFileMetaDataPanel()));
    }
    ContentFileInfoController.getContentPanel = getContentPanel;
    function toggleMetaDataPanel() {
        let show = !Utils.tryGetBool(window, "showFileMetaDataPanel", true);
        window["showFileMetaDataPanel"] = show;
        $(".metaInfo").toggle(show);
    }
    function getFileMetaDataPanel() {
        if (ContentFileInfoController.fileDetails == null)
            return null;
        let items = [];
        if (Utils.trimString(ContentFileInfoController.fileDetails.title, null) != null)
            items.push(React.createElement("div", { className: "item", key: "metaTitle" },
                React.createElement("b", null, "Title:"),
                " ",
                React.createElement("span", { className: "value" }, ContentFileInfoController.fileDetails.title)));
        if (Utils.trimString(ContentFileInfoController.fileDetails.url, null) != null)
            items.push(React.createElement("div", { className: "item", key: "metaUrl" },
                React.createElement("b", null, "File:"),
                " ",
                React.createElement("span", { className: "value" }, ContentFileInfoController.fileDetails.url)));
        if (Utils.trimString(ContentFileInfoController.fileDetails.fileSizeDesc, null) != null)
            items.push(React.createElement("div", { className: "item", key: "metaSize" },
                React.createElement("b", null, "File size:"),
                " ",
                React.createElement("span", { className: "value" }, ContentFileInfoController.fileDetails.fileSizeDesc)));
        let panelStyle = {};
        if (!Utils.tryGetBool(window, "showFileMetaDataPanel", true))
            panelStyle.display = "none";
        if (items.length > 0)
            return (React.createElement("div", { className: "metaInfo", style: panelStyle },
                React.createElement("h2", null,
                    React.createElement(FontIcon, { iconName: "Info" }),
                    " Information"),
                items));
        return null;
    }
    ContentFileInfoController.getFileMetaDataPanel = getFileMetaDataPanel;
    let Rename;
    (function (Rename) {
        function show() {
            renameDialogCallbacks.setTrue();
        }
        Rename.show = show;
        function finish() {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                let fileName = Utils.trimString($("#renameInput", "").val());
                renameDialogCallbacks.setFalse();
                waitingDialogCallbacks.setTrue();
                let response = yield Workspaces.renameFile(ContentFileInfoController.fileDetails === null || ContentFileInfoController.fileDetails === void 0 ? void 0 : ContentFileInfoController.fileDetails.reactLocalUrl, fileName);
                waitingDialogCallbacks.setFalse();
                if (((_a = response === null || response === void 0 ? void 0 : response.actionStatus) === null || _a === void 0 ? void 0 : _a.isOk) == true) {
                    let newUrl = Utils.trimString(response === null || response === void 0 ? void 0 : response.newUrl, "");
                    if (!newUrl.startsWith("/"))
                        newUrl = "/" + newUrl;
                    Workspaces.clearTreeCache();
                    EventBus.dispatch("fileStructChanged");
                    navigateCallback("/workspace" + newUrl);
                }
                else {
                    let title = "Can't rename file";
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
    })(Rename = ContentFileInfoController.Rename || (ContentFileInfoController.Rename = {}));
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
    })(Move = ContentFileInfoController.Move || (ContentFileInfoController.Move = {}));
})(ContentFileInfoController || (ContentFileInfoController = {}));
//# sourceMappingURL=ContentFileInfo.js.map