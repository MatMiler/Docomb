var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FontIcon, Spinner, SpinnerSize } from '@fluentui/react';
import React, { useEffect, useState } from 'react';
import { Utils } from '../../Data/Utils';
import { Workspaces } from '../../Data/Workspaces';
import { LayoutUtils } from '../../LayoutUtils';
import PageBreadcrumbs from './PageBreadcrumbs';
import $ from 'jquery';
const ContentFileInfo = () => {
    const [loadedUrl, setLoadedUrl] = useState(null);
    function onDataChange() {
        var _a, _b;
        if (loadedUrl != ((_a = ContentFileInfoController.fileDetails) === null || _a === void 0 ? void 0 : _a.reactLocalUrl))
            setLoadedUrl((_b = ContentFileInfoController.fileDetails) === null || _b === void 0 ? void 0 : _b.reactLocalUrl);
    }
    useEffect(() => {
        ContentFileInfoController.callbackOnData = onDataChange;
        ContentFileInfoController.loadData();
        return () => { ContentFileInfoController.callbackOnData = null; };
    });
    return (React.createElement("div", { className: "pageGrid" },
        React.createElement("div", { className: "pageTitle" },
            React.createElement(PageBreadcrumbs, null)),
        ContentFileInfoController.getToolbar(),
        React.createElement("div", { className: "pageContent" }, ContentFileInfoController.getContentPanel())));
};
export default ContentFileInfo;
var ContentFileInfoController;
(function (ContentFileInfoController) {
    ContentFileInfoController.callbackOnData = null;
    let pageInfo = null;
    ContentFileInfoController.fileDetails = null;
    ContentFileInfoController.isLoaded = false;
    function loadData() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let callback = ContentFileInfoController.callbackOnData;
            let newPageInfo = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo);
            if (((_a = newPageInfo === null || newPageInfo === void 0 ? void 0 : newPageInfo.contentItem) === null || _a === void 0 ? void 0 : _a.reactLocalUrl) != ((_b = pageInfo === null || pageInfo === void 0 ? void 0 : pageInfo.contentItem) === null || _b === void 0 ? void 0 : _b.reactLocalUrl)) {
                ContentFileInfoController.isLoaded = false;
            }
            else if (ContentFileInfoController.isLoaded) {
                return;
            }
            pageInfo = newPageInfo;
            ContentFileInfoController.fileDetails = yield Workspaces.loadFileDetails(pageInfo.contentItem.reactLocalUrl);
            ContentFileInfoController.isLoaded = true;
            if (callback != null)
                callback();
        });
    }
    ContentFileInfoController.loadData = loadData;
    function isReady() {
        var _a;
        return (ContentFileInfoController.isLoaded) && (Utils.TryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo), ["contentItem", "reactLocalUrl"]) == ((_a = pageInfo === null || pageInfo === void 0 ? void 0 : pageInfo.contentItem) === null || _a === void 0 ? void 0 : _a.reactLocalUrl));
    }
    function getToolbar() {
        if (!isReady())
            return null;
        return null;
    }
    ContentFileInfoController.getToolbar = getToolbar;
    function getContentPanel() {
        if (!isReady())
            return (React.createElement("div", { className: "loadingSpinner" },
                React.createElement(Spinner, { label: "Loading...", labelPosition: "right", size: SpinnerSize.large })));
        switch (ContentFileInfoController.fileDetails === null || ContentFileInfoController.fileDetails === void 0 ? void 0 : ContentFileInfoController.fileDetails.type) {
            case Workspaces.FileType.Markdown:
            case Workspaces.FileType.Html: {
                return (React.createElement("div", { className: "contentFileDetails" },
                    React.createElement("div", { className: "articleContent", dangerouslySetInnerHTML: { __html: fixLocalLinksInHtml(ContentFileInfoController.fileDetails.contentHtml) } }),
                    getFileMetaDataPanel()));
            }
            case Workspaces.FileType.PlainText: {
                return (React.createElement("div", { className: "contentFileDetails" },
                    React.createElement("div", { className: "articleContent" },
                        React.createElement("pre", { className: "plainTextFile" }, ContentFileInfoController.fileDetails.contentText)),
                    getFileMetaDataPanel()));
            }
            default: {
                return (React.createElement("div", { className: "contentFileDetails" },
                    React.createElement("div", { className: "articleContent" }, "Preview is not supported for this file type"),
                    getFileMetaDataPanel()));
            }
        }
        return null;
    }
    ContentFileInfoController.getContentPanel = getContentPanel;
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
        if (items.length > 0)
            return (React.createElement("div", { className: "metaInfo" },
                React.createElement("h2", null,
                    React.createElement(FontIcon, { iconName: "Info" }),
                    " Information"),
                items));
        return null;
    }
    ContentFileInfoController.getFileMetaDataPanel = getFileMetaDataPanel;
    function fixLocalLinksInHtml(html) {
        var _a;
        try {
            let container = $("<div />").html(html);
            let readerBasePath = Utils.TryGetString(window, "readerBasePath");
            if (!readerBasePath.endsWith("/"))
                readerBasePath += "/";
            readerBasePath += (_a = pageInfo === null || pageInfo === void 0 ? void 0 : pageInfo.workspace) === null || _a === void 0 ? void 0 : _a.url;
            if (!readerBasePath.endsWith("/"))
                readerBasePath += "/";
            container.find("a").each((index, element) => {
                let a = $(element);
                a.attr("target", "_blank");
                let href = a.attr("href");
                if (Utils.TrimString(href, null) != null) {
                    let slashPos = href.indexOf("/");
                    if (slashPos == 0)
                        return;
                    let hashPos = href.indexOf("#");
                    let doubleSlashPos = href.indexOf("//");
                    let paramPos = href.indexOf("?");
                    if (hashPos < 0)
                        hashPos = href.length;
                    if (doubleSlashPos < 0)
                        doubleSlashPos = href.length;
                    if (paramPos < 0)
                        paramPos = href.length;
                    if ((doubleSlashPos >= hashPos) && (doubleSlashPos >= paramPos)) {
                        href = readerBasePath + href;
                        a.attr("href", href);
                    }
                }
            });
            html = container.html();
        }
        catch (e) { }
        return html;
    }
    ContentFileInfoController.fixLocalLinksInHtml = fixLocalLinksInHtml;
})(ContentFileInfoController || (ContentFileInfoController = {}));
//# sourceMappingURL=ContentFileInfo.js.map