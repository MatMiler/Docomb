import { CommandBar, FontIcon } from '@fluentui/react';
import React from 'react';
import { useHistory } from "react-router-dom";
import { Utils } from '../../Data/Utils';
import { Workspaces } from '../../Data/Workspaces';
import { LayoutUtils } from '../../LayoutUtils';
import PageBreadcrumbs from './PageBreadcrumbs';
import $ from 'jquery';
const ContentFileInfo = () => {
    const history = useHistory();
    function navigate(url) { history.push(url); }
    ContentFileInfoController.prepData(navigate);
    return (React.createElement("div", { className: "pageGrid" },
        React.createElement("div", { className: "pageTitle" },
            React.createElement(PageBreadcrumbs, null)),
        ContentFileInfoController.getToolbar(),
        React.createElement("div", { className: "pageContent" }, ContentFileInfoController.getContentPanel())));
};
export default ContentFileInfo;
var ContentFileInfoController;
(function (ContentFileInfoController) {
    ContentFileInfoController.pageInfo = null;
    ContentFileInfoController.fileDetails = null;
    ContentFileInfoController.navigateCallback = null;
    function prepData(navigateCallback) {
        let newPageInfo = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo);
        ContentFileInfoController.pageInfo = newPageInfo;
        ContentFileInfoController.fileDetails = ContentFileInfoController.pageInfo === null || ContentFileInfoController.pageInfo === void 0 ? void 0 : ContentFileInfoController.pageInfo.details;
        ContentFileInfoController.navigateCallback = navigateCallback;
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
        commandBarItems.push({ key: "rename", text: "Rename", disabled: true, iconProps: { iconName: "Rename" } });
        commandBarItems.push({ key: "delete", text: "Delete", disabled: true, iconProps: { iconName: "Delete" } });
        let farItems = [
            { key: "toggleInfo", text: "Toggle file information", iconOnly: true, ariaLabel: "Toggle file information", iconProps: { iconName: "Info" }, onClick: toggleMetaDataPanel }
        ];
        return (React.createElement("div", { className: "pageCommands" },
            React.createElement(CommandBar, { items: commandBarItems, farItems: farItems })));
    }
    ContentFileInfoController.getToolbar = getToolbar;
    function gotoEditor() {
        if (ContentFileInfoController.navigateCallback != null)
            ContentFileInfoController.navigateCallback("/workspace" + (ContentFileInfoController.fileDetails === null || ContentFileInfoController.fileDetails === void 0 ? void 0 : ContentFileInfoController.fileDetails.reactLocalUrl) + "?action=edit");
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
        let show = !Utils.TryGetBool(window, "showFileMetaDataPanel", true);
        window["showFileMetaDataPanel"] = show;
        $(".metaInfo").toggle(show);
    }
    function getFileMetaDataPanel() {
        if (ContentFileInfoController.fileDetails == null)
            return null;
        let items = [];
        if (Utils.TrimString(ContentFileInfoController.fileDetails.title, null) != null)
            items.push(React.createElement("div", { className: "item", key: "metaTitle" },
                React.createElement("b", null, "Title:"),
                " ",
                React.createElement("span", { className: "value" }, ContentFileInfoController.fileDetails.title)));
        if (Utils.TrimString(ContentFileInfoController.fileDetails.url, null) != null)
            items.push(React.createElement("div", { className: "item", key: "metaUrl" },
                React.createElement("b", null, "File:"),
                " ",
                React.createElement("span", { className: "value" }, ContentFileInfoController.fileDetails.url)));
        if (Utils.TrimString(ContentFileInfoController.fileDetails.fileSizeDesc, null) != null)
            items.push(React.createElement("div", { className: "item", key: "metaSize" },
                React.createElement("b", null, "File size:"),
                " ",
                React.createElement("span", { className: "value" }, ContentFileInfoController.fileDetails.fileSizeDesc)));
        let panelStyle = {};
        if (!Utils.TryGetBool(window, "showFileMetaDataPanel", true))
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
})(ContentFileInfoController || (ContentFileInfoController = {}));
//# sourceMappingURL=ContentFileInfo.js.map