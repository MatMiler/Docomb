import { CommandBar, ContextualMenuItemType } from '@fluentui/react';
import React from 'react';
import { Utils } from '../../Data/Utils';
import { LayoutUtils } from '../../LayoutUtils';
import PageBreadcrumbs from './PageBreadcrumbs';
const ContentDirectory = () => {
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
    let directoryUrl = Utils.TryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo), ["contentItem", "url"]);
    if (!directoryUrl.startsWith("/"))
        directoryUrl = "/" + directoryUrl;
    if (!directoryUrl.endsWith("/"))
        directoryUrl += "/";
    if (directoryUrl != "/") {
        commandBarItems.push({ key: "rename", text: "Rename", disabled: true, iconProps: { iconName: "Rename" } });
        commandBarItems.push({ key: "delete", text: "Delete", disabled: true, iconProps: { iconName: "Delete" } });
    }
    return (React.createElement("div", { className: "pageGrid" },
        React.createElement("div", { className: "pageTitle" },
            React.createElement(PageBreadcrumbs, null)),
        React.createElement("div", { className: "pageCommands" },
            React.createElement(CommandBar, { items: commandBarItems })),
        React.createElement("div", { className: "pageContent" })));
};
export default ContentDirectory;
//# sourceMappingURL=ContentDirectory.js.map