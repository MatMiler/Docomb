import { CommandBar, TextField } from "@fluentui/react";
import React from "react";
import { useHistory } from "react-router-dom";
import { Utils } from "../../Data/Utils";
import { Workspaces } from "../../Data/Workspaces";
import { LayoutUtils } from "../../LayoutUtils";
import PageBreadcrumbs from "./PageBreadcrumbs";
import $ from 'jquery';
const EditTextFile = () => {
    const history = useHistory();
    function navigate(url) { history.push(url); }
    EditTextFileController.prepData(navigate);
    return (React.createElement("div", { className: "pageGrid" },
        React.createElement("div", { className: "pageTitle" },
            React.createElement(PageBreadcrumbs, null)),
        EditTextFileController.getToolbar(),
        React.createElement("div", { className: "pageContent" }, EditTextFileController.getContentPanel())));
};
export default EditTextFile;
var EditTextFileController;
(function (EditTextFileController) {
    EditTextFileController.pageInfo = null;
    EditTextFileController.fileDetails = null;
    EditTextFileController.navigateCallback = null;
    let content = null;
    function prepData(navigateCallback) {
        let newPageInfo = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo);
        EditTextFileController.pageInfo = newPageInfo;
        EditTextFileController.fileDetails = EditTextFileController.pageInfo === null || EditTextFileController.pageInfo === void 0 ? void 0 : EditTextFileController.pageInfo.details;
        content = EditTextFileController.fileDetails === null || EditTextFileController.fileDetails === void 0 ? void 0 : EditTextFileController.fileDetails.contentText;
        EditTextFileController.navigateCallback = navigateCallback;
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
    function save() {
        $.ajax({
            url: "api/content/saveTextFile",
            type: "POST",
            data: { url: EditTextFileController.fileDetails === null || EditTextFileController.fileDetails === void 0 ? void 0 : EditTextFileController.fileDetails.reactLocalUrl, textContent: content },
            success: onSaveSuccess,
            error: onSaveError
        });
    }
    function onSaveSuccess(response) {
        gotoInfo();
    }
    function onSaveError() {
    }
    function getContentPanel() {
        let previewStyle = {};
        if (!Utils.tryGetBool(window, "showFileMetaDataPanel", true))
            previewStyle.display = "none";
        switch (EditTextFileController.fileDetails === null || EditTextFileController.fileDetails === void 0 ? void 0 : EditTextFileController.fileDetails.type) {
            case Workspaces.FileType.Markdown: {
                return (React.createElement("div", { className: "editTextFile" },
                    React.createElement("div", { className: "editor" },
                        React.createElement(TextField, { defaultValue: EditTextFileController.fileDetails === null || EditTextFileController.fileDetails === void 0 ? void 0 : EditTextFileController.fileDetails.contentText, multiline: true, resizable: false, borderless: true, onChange: onEditorChange }))));
            }
            case Workspaces.FileType.Html:
            case Workspaces.FileType.PlainText: {
                return (React.createElement("div", { className: "editTextFile" },
                    React.createElement("div", { className: "editor" },
                        React.createElement(TextField, { defaultValue: EditTextFileController.fileDetails === null || EditTextFileController.fileDetails === void 0 ? void 0 : EditTextFileController.fileDetails.contentText, multiline: true, resizable: false, borderless: true, onChange: onEditorChange }))));
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