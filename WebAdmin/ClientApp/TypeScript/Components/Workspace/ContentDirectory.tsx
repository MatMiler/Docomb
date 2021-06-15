import { CommandBar, ContextualMenuItemType, ICommandBarItemProps } from '@fluentui/react';
import React, { FC, ReactElement } from 'react';
import { Utils } from '../../Data/Utils';
import { LayoutUtils } from '../../LayoutUtils';
import PageBreadcrumbs from './PageBreadcrumbs';


const ContentDirectory: FC<{}> = (): ReactElement => {

	let commandBarItems: ICommandBarItemProps[] = [
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
	if (!directoryUrl.startsWith("/")) directoryUrl = "/" + directoryUrl;
	if (!directoryUrl.endsWith("/")) directoryUrl += "/";
	if (directoryUrl != "/") {
		commandBarItems.push({ key: "rename", text: "Rename", disabled: true, iconProps: { iconName: "Rename" } });
		commandBarItems.push({ key: "delete", text: "Delete", disabled: true, iconProps: { iconName: "Delete" } });
	}

	return (
		<div className="pageGrid">
			<div className="pageTitle"><PageBreadcrumbs /></div>
			<div className="pageCommands">
				<CommandBar items={commandBarItems} />
			</div>
			<div className="pageContent">{/*Directory*/}</div>
		</div>
	);
};

export default ContentDirectory;
