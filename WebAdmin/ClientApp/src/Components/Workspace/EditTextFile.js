var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CommandBar, Dialog, DialogFooter, DialogType, FontIcon, mergeStyles, PrimaryButton, Spinner, SpinnerSize, Stack, TextField } from "@fluentui/react";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useBoolean } from '@fluentui/react-hooks';
import { Utils } from "../../Data/Utils";
import { Workspaces } from "../../Data/Workspaces";
import { LayoutUtils } from "../../LayoutUtils";
import PageBreadcrumbs from "./PageBreadcrumbs";
import $ from 'jquery';
import { Apis } from "../../Data/Apis";
const EditTextFile = () => {
    const history = useHistory();
    function navigate(url) { history.push(url); }
    const [waitingIsVisible, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting }] = useBoolean(false);
    const [alertIsVisible, { toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert }] = useBoolean(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertContent, setAlertContent] = useState("");
    EditTextFileController.prepData(navigate, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting }, { toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert, setTitle: setAlertTitle, setContent: setAlertContent });
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "pageGrid" },
            React.createElement("div", { className: "pageTitle" },
                React.createElement(PageBreadcrumbs, null)),
            EditTextFileController.getToolbar(),
            React.createElement("div", { className: "pageContent" }, EditTextFileController.getContentPanel())),
        React.createElement(Dialog, { hidden: !waitingIsVisible, dialogContentProps: { type: DialogType.normal, title: null, showCloseButton: false }, modalProps: { isBlocking: true } },
            React.createElement(DialogFooter, null,
                React.createElement(Spinner, { label: "Please wait...", labelPosition: "right", size: SpinnerSize.large }))),
        React.createElement(Dialog, { hidden: !alertIsVisible, dialogContentProps: { type: DialogType.largeHeader, title: alertTitle }, modalProps: { isBlocking: false }, onDismiss: hideAlert },
            React.createElement(Stack, { horizontal: true, verticalAlign: "center" },
                React.createElement(FontIcon, { iconName: "Warning", className: mergeStyles({ fontSize: 30, width: 30, height: 36, lineHeight: 36, margin: "0 16px 0 0" }) }),
                React.createElement("div", null, alertContent)),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: hideAlert, text: "OK" })))));
};
export default EditTextFile;
var EditTextFileController;
(function (EditTextFileController) {
    EditTextFileController.pageInfo = null;
    EditTextFileController.fileDetails = null;
    let content = null;
    EditTextFileController.navigateCallback = null;
    let waitingDialogCallbacks = null;
    let alertDialogCallbacks = null;
    function prepData(navigate, waitingDialog, alertDialog) {
        let newPageInfo = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo);
        EditTextFileController.pageInfo = newPageInfo;
        EditTextFileController.fileDetails = EditTextFileController.pageInfo === null || EditTextFileController.pageInfo === void 0 ? void 0 : EditTextFileController.pageInfo.details;
        content = EditTextFileController.fileDetails === null || EditTextFileController.fileDetails === void 0 ? void 0 : EditTextFileController.fileDetails.contentText;
        EditTextFileController.navigateCallback = navigate;
        waitingDialogCallbacks = waitingDialog;
        alertDialogCallbacks = alertDialog;
    }
    EditTextFileController.prepData = prepData;
    function getToolbar() {
        let commandBarItems = [];
        let farItems = [];
        let hasPreview = false;
        commandBarItems.push({ key: "save", text: "Save", onClick: save, iconProps: { iconName: "Save" } });
        commandBarItems.push({ key: "cancel", text: "Cancel & close", onClick: gotoInfo, iconProps: { iconName: "Cancel" } });
        switch (EditTextFileController.fileDetails === null || EditTextFileController.fileDetails === void 0 ? void 0 : EditTextFileController.fileDetails.type) {
            case Workspaces.FileType.Markdown: {
                hasPreview = true;
                break;
            }
            case Workspaces.FileType.Html: {
                hasPreview = true;
                break;
            }
            //case Workspaces.FileType.PlainText: { hasPreview = false; break; }
        }
        //if (hasPreview) {
        //	//commandBarItems.push({ key: "preview", text: "Preview", iconProps: { iconName: "Preview" } });
        //	farItems.push({ key: "togglePreview", text: "Toggle preview", iconOnly: true, ariaLabel: "Toggle preview", iconProps: { iconName: "View" }, onClick: togglePreviewPanel });
        //}
        return (React.createElement("div", { className: "pageCommands" },
            React.createElement(CommandBar, { items: commandBarItems, farItems: farItems })));
    }
    EditTextFileController.getToolbar = getToolbar;
    function gotoInfo() {
        if (EditTextFileController.navigateCallback != null)
            EditTextFileController.navigateCallback("/workspace" + (EditTextFileController.fileDetails === null || EditTextFileController.fileDetails === void 0 ? void 0 : EditTextFileController.fileDetails.reactLocalUrl));
    }
    function save() { saveAsync(); }
    function saveAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            waitingDialogCallbacks.setTrue();
            let c = Utils.parseString($("#editorInput").val(), content);
            let response = null;
            response = yield Apis.postJsonAsync("api/content/saveTextFile", { url: EditTextFileController.fileDetails === null || EditTextFileController.fileDetails === void 0 ? void 0 : EditTextFileController.fileDetails.reactLocalUrl, textContent: c });
            waitingDialogCallbacks.setFalse();
            let status = new Apis.ActionStatus(response);
            if ((status === null || status === void 0 ? void 0 : status.isOk) == true) {
                gotoInfo();
            }
            else {
                let title = "Can't save changes";
                let desc = status.getDialogMessage();
                alertDialogCallbacks.setTrue();
                alertDialogCallbacks.setTitle(title);
                alertDialogCallbacks.setContent(desc);
            }
        });
    }
    function onSaveSuccess(response) {
        gotoInfo();
        waitingDialogCallbacks.setFalse();
    }
    function onSaveError() {
        waitingDialogCallbacks.setFalse();
    }
    function getContentPanel() {
        let previewStyle = {};
        if (!Utils.tryGetBool(window, "showFileMetaDataPanel", true))
            previewStyle.display = "none";
        switch (EditTextFileController.fileDetails === null || EditTextFileController.fileDetails === void 0 ? void 0 : EditTextFileController.fileDetails.type) {
            case Workspaces.FileType.Markdown: {
                return (React.createElement("div", { className: "editTextFile" },
                    React.createElement("div", { className: "editor" },
                        React.createElement(TextField, { id: "editorInput", defaultValue: EditTextFileController.fileDetails === null || EditTextFileController.fileDetails === void 0 ? void 0 : EditTextFileController.fileDetails.contentText, multiline: true, resizable: false, borderless: true, onChange: onEditorChange }))));
            }
            case Workspaces.FileType.Html:
            case Workspaces.FileType.PlainText: {
                return (React.createElement("div", { className: "editTextFile" },
                    React.createElement("div", { className: "editor" },
                        React.createElement(TextField, { id: "editorInput", defaultValue: EditTextFileController.fileDetails === null || EditTextFileController.fileDetails === void 0 ? void 0 : EditTextFileController.fileDetails.contentText, multiline: true, resizable: false, borderless: true, onChange: onEditorChange }))));
            }
        }
        return (React.createElement("div", { className: "editTextFile" },
            React.createElement("div", { className: "articleContent" }, "Edit is not supported for this file type")));
    }
    EditTextFileController.getContentPanel = getContentPanel;
    //function togglePreviewPanel(): void {
    //	let show = !Utils.tryGetBool(window, "showPreviewPanel", true);
    //	window["showPreviewPanel"] = show;
    //	$(".preview").toggle(show);
    //}
    function onEditorChange(ev, newText) {
        content = newText;
        //	switch (fileDetails?.type) {
        //		case Workspaces.FileType.Markdown: {
        //			$("#previewContainer").text(content);
        //			break;
        //		}
        //	}
    }
})(EditTextFileController || (EditTextFileController = {}));
//# sourceMappingURL=EditTextFile.js.map