var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CommandBar, Dialog, DialogFooter, DialogType, mergeStyles, PrimaryButton, Spinner, SpinnerSize, Stack, TextField } from "@fluentui/react";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useBoolean } from '@fluentui/react-hooks';
import { Utils } from "../../Data/Utils";
import { Workspaces } from "../../Data/Workspaces";
import { LayoutUtils } from "../../LayoutUtils";
import PageBreadcrumbs from "./PageBreadcrumbs";
import $ from 'jquery';
import { Apis } from "../../Data/Apis";
import { WarningIcon, EditIcon, EntryViewIcon, UnknownIcon } from '@fluentui/react-icons-mdl2';
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
                React.createElement(WarningIcon, { className: mergeStyles({ fontSize: 30, width: 30, height: 36, lineHeight: 36, margin: "0 16px 0 0" }) }),
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
            //case Workspaces.FileType.Html: { hasPreview = true; break; }
            //case Workspaces.FileType.PlainText: { hasPreview = false; break; }
        }
        if (hasPreview) {
            farItems.push({ key: "togglePreview", text: "Toggle preview", iconOnly: true, ariaLabel: "Toggle preview", iconProps: { iconName: "EntryView" }, onClick: togglePreviewPanel });
        }
        if ((EditTextFileController.fileDetails === null || EditTextFileController.fileDetails === void 0 ? void 0 : EditTextFileController.fileDetails.type) == Workspaces.FileType.Markdown) {
            farItems.push({ key: "toggleMarkdownHelp", text: "Toggle help", iconOnly: true, ariaLabel: "Toggle help", iconProps: { iconName: "Unknown" }, onClick: toggleHelpPanel });
        }
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
    function getContentPanel() {
        let previewStyle = {};
        if (!Utils.tryGetBool(window, "showPreviewPanel", true))
            previewStyle.display = "none";
        switch (EditTextFileController.fileDetails === null || EditTextFileController.fileDetails === void 0 ? void 0 : EditTextFileController.fileDetails.type) {
            case Workspaces.FileType.Markdown: {
                return (React.createElement("div", { className: "editTextFile" },
                    React.createElement("div", { className: "editor watermarkedPart" },
                        React.createElement("div", { className: "watermark" },
                            React.createElement(EditIcon, null)),
                        React.createElement("div", { className: "editorInput" },
                            React.createElement(TextField, { id: "editorInput", defaultValue: EditTextFileController.fileDetails === null || EditTextFileController.fileDetails === void 0 ? void 0 : EditTextFileController.fileDetails.contentText, multiline: true, resizable: false, onChange: onEditorChange }))),
                    React.createElement("div", { className: "preview watermarkedPart", style: previewStyle },
                        React.createElement("div", { className: "watermark" },
                            React.createElement(EntryViewIcon, null)),
                        React.createElement("div", { id: "previewContainer", className: "articleContent", dangerouslySetInnerHTML: { __html: LayoutUtils.fixLocalLinksInHtml(EditTextFileController.fileDetails.contentHtml, EditTextFileController.pageInfo === null || EditTextFileController.pageInfo === void 0 ? void 0 : EditTextFileController.pageInfo.workspace, EditTextFileController.pageInfo === null || EditTextFileController.pageInfo === void 0 ? void 0 : EditTextFileController.pageInfo.contentItem) } })),
                    getMarkdownHelpPanel()));
            }
            case Workspaces.FileType.Html:
            case Workspaces.FileType.PlainText: {
                return (React.createElement("div", { className: "editTextFile" },
                    React.createElement("div", { className: "editor watermarkedPart" },
                        React.createElement("div", { className: "watermark" },
                            React.createElement(EditIcon, null)),
                        React.createElement("div", { className: "editorInput" },
                            React.createElement(TextField, { id: "editorInput", defaultValue: EditTextFileController.fileDetails === null || EditTextFileController.fileDetails === void 0 ? void 0 : EditTextFileController.fileDetails.contentText, multiline: true, resizable: false, onChange: onEditorChange })))));
            }
        }
        return (React.createElement("div", { className: "editTextFile" },
            React.createElement("div", { className: "articleContent" }, "Edit is not supported for this file type")));
    }
    EditTextFileController.getContentPanel = getContentPanel;
    function togglePreviewPanel() {
        let show = !Utils.tryGetBool(window, "showPreviewPanel", true);
        window["showPreviewPanel"] = show;
        $(".preview").toggle(show);
    }
    function getMarkdownHelpPanel() {
        let elements = [];
        let preStyle = { whiteSpace: "normal" };
        elements.push(React.createElement(React.Fragment, null,
            getHelpHeadingRow("Basic styles"),
            React.createElement("div", { className: "articleContent" },
                React.createElement("p", null,
                    React.createElement("code", null, "**Bold**"),
                    " or ",
                    React.createElement("code", null, "__Bold__"),
                    " \u2192 ",
                    React.createElement("strong", null, "Bold")),
                React.createElement("p", null,
                    React.createElement("code", null, "*Italic*"),
                    " or ",
                    React.createElement("code", null, "_Italic_"),
                    " \u2192 ",
                    React.createElement("em", null, "Italic")))));
        elements.push(React.createElement(React.Fragment, null,
            getHelpHeadingRow("Headings"),
            React.createElement("div", { className: "articleContent" },
                React.createElement("p", null,
                    React.createElement("code", null, "# Heading 1 (page title)"),
                    React.createElement("br", null),
                    React.createElement("code", null, "## Heading 2"),
                    React.createElement("br", null),
                    React.createElement("code", null, "### Heading 3"),
                    React.createElement("br", null),
                    "etc."),
                React.createElement("p", null, "or"),
                React.createElement("pre", { style: preStyle },
                    React.createElement("code", null,
                        "Heading 1",
                        React.createElement("br", null),
                        "===")),
                React.createElement("pre", { style: preStyle },
                    React.createElement("code", null,
                        "Heading 2",
                        React.createElement("br", null),
                        "---")))));
        elements.push(React.createElement(React.Fragment, null,
            getHelpHeadingRow("Paragraphs"),
            React.createElement("div", { className: "articleContent" },
                React.createElement("p", null, "Add an empty line between texts to start a new paragraph."),
                React.createElement("p", null,
                    "Add two spaces at the end of the line",
                    React.createElement("code", null, "\u00B7\u00B7"),
                    React.createElement("br", null),
                    " to start a new line."),
                React.createElement("p", null,
                    "For a horizontal rule write ",
                    React.createElement("code", null, "---"),
                    ", ",
                    React.createElement("code", null, "***"),
                    ", or ",
                    React.createElement("code", null, "___"),
                    ".",
                    React.createElement("br", null),
                    React.createElement("small", null,
                        "Be sure to have an empty line above ",
                        React.createElement("code", null, "---"),
                        " to avoid rendering the previous line as a heading.")))));
        elements.push(React.createElement(React.Fragment, null,
            getHelpHeadingRow("Lists"),
            React.createElement("div", { className: "articleContent" },
                React.createElement("p", null,
                    "Start a line with ",
                    React.createElement("code", null, "-"),
                    " or ",
                    React.createElement("code", null, "*"),
                    " for a bulleted list."),
                React.createElement("p", null,
                    "Start a line with ",
                    React.createElement("code", null, "1."),
                    " or ",
                    React.createElement("code", null, "1)"),
                    " for a numbered list."))));
        elements.push(React.createElement(React.Fragment, null,
            getHelpHeadingRow("Links & Images"),
            React.createElement("div", { className: "articleContent" },
                React.createElement("p", null,
                    React.createElement("code", null, "[Link text](URL)"),
                    React.createElement("br", null),
                    "Example: ",
                    React.createElement("code", null, "[Link](http://example.com/)"),
                    " \u2192 ",
                    React.createElement("a", { href: "http://example.com/", target: "_blank" }, "Link")),
                React.createElement("p", null,
                    React.createElement("code", null, "![Alt text](Image URL)")))));
        elements.push(React.createElement(React.Fragment, null,
            getHelpHeadingRow("Quotes & Code"),
            React.createElement("div", { className: "articleContent" },
                React.createElement("p", null,
                    React.createElement("code", null, "> Quote")),
                React.createElement("blockquote", null,
                    React.createElement("p", null, "Quote")),
                React.createElement("p", null,
                    "For inline ",
                    React.createElement("code", null, "code"),
                    ", use single backticks before and after: ",
                    React.createElement("code", null, "`code`"),
                    "."),
                React.createElement("pre", { style: preStyle },
                    "```",
                    React.createElement("br", null),
                    "For a code block use three backticks before and after",
                    React.createElement("br", null),
                    "```"))));
        let panelStyle = {};
        if (!Utils.tryGetBool(window, "showHelpPanel", false))
            panelStyle.display = "none";
        for (let x = 0; x < elements.length; x++) {
            let className = "helpSection";
            if (x == 0)
                className += " first";
            if (x == elements.length - 1)
                className += " last";
            elements[x] = (React.createElement("div", { className: className, key: "HelpSection" + x }, elements[x]));
        }
        return (React.createElement("div", { className: "help watermarkedPart", style: panelStyle },
            React.createElement("div", { className: "watermark" },
                React.createElement(UnknownIcon, null)),
            React.createElement("div", { id: "helpContainer" }, elements)));
    }
    function getHelpHeadingRow(text) {
        return React.createElement("div", { className: "helpHeading" }, text);
    }
    function toggleHelpPanel() {
        let show = !Utils.tryGetBool(window, "showHelpPanel", false);
        window["showHelpPanel"] = show;
        $(".help").toggle(show);
    }
    function onEditorChange(ev, newText) {
        let prevContent = content;
        content = newText;
        switch (EditTextFileController.fileDetails === null || EditTextFileController.fileDetails === void 0 ? void 0 : EditTextFileController.fileDetails.type) {
            case Workspaces.FileType.Markdown: {
                let immediate = false;
                let eventType = Utils.tryGetString(ev, ["nativeEvent", "inputType"]);
                switch (eventType) {
                    case "deleteByCut":
                    case "insertFromPaste":
                    case "insertFromDrop": {
                        immediate = true;
                        break;
                    }
                }
                MarkdownPreview.refresh(content, prevContent, immediate);
                break;
            }
        }
    }
    let MarkdownPreview;
    (function (MarkdownPreview) {
        function refresh(content, prevContent, immediate = false) {
            if (content == prevContent)
                return; // No changes
            if (((Date.now() - lastRequest) < requestTimeout) && ((updateTimeoutId > 0) || (isExecuting)))
                return; // Already queued
            let sinceLast = Date.now() - lastUpdate;
            if (immediate == true) {
                if (sinceLast < minUpdateInterval) {
                    request();
                    lastRequest = Date.now();
                    return;
                }
                updateTimeoutId = window.setTimeout(request, minUpdateInterval - sinceLast);
                lastRequest = Date.now();
                return;
            }
            updateTimeoutId = window.setTimeout(request, minUpdateInterval);
            lastRequest = Date.now();
        }
        MarkdownPreview.refresh = refresh;
        const minUpdateInterval = 1500;
        const requestTimeout = 15000;
        let updateTimeoutId = null;
        let lastUpdate = 0;
        let lastRequest = 0;
        let isExecuting = false;
        function request() {
            return __awaiter(this, void 0, void 0, function* () {
                isExecuting = true;
                try {
                    let c = Utils.parseString($("#editorInput").val(), content);
                    let response = yield Apis.postJsonAsync("api/content/previewMarkdown", { url: EditTextFileController.fileDetails === null || EditTextFileController.fileDetails === void 0 ? void 0 : EditTextFileController.fileDetails.reactLocalUrl, textContent: c });
                    let status = new Apis.ActionStatus(Utils.tryGet(response, "actionStatus"));
                    if ((status === null || status === void 0 ? void 0 : status.isOk) == true) {
                        let html = Utils.tryGetString(response, "data");
                        html = LayoutUtils.fixLocalLinksInHtml(html, EditTextFileController.pageInfo === null || EditTextFileController.pageInfo === void 0 ? void 0 : EditTextFileController.pageInfo.workspace, EditTextFileController.pageInfo === null || EditTextFileController.pageInfo === void 0 ? void 0 : EditTextFileController.pageInfo.contentItem);
                        $("#previewContainer").html(html);
                    }
                }
                catch (e) { }
                lastUpdate = Date.now();
                updateTimeoutId = null;
                isExecuting = false;
            });
        }
    })(MarkdownPreview || (MarkdownPreview = {}));
})(EditTextFileController || (EditTextFileController = {}));
//# sourceMappingURL=EditTextFile.js.map