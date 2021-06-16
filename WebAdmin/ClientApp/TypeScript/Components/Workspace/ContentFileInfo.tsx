import { CommandBar, FontIcon, ICommandBarItemProps } from '@fluentui/react';
import React, { FC, ReactElement } from 'react';
import { useHistory } from "react-router-dom";
import { Utils } from '../../Data/Utils';
import { Workspaces } from '../../Data/Workspaces';
import { LayoutUtils } from '../../LayoutUtils';
import PageBreadcrumbs from './PageBreadcrumbs';
import $ from 'jquery';


const ContentFileInfo: FC<{}> = (): ReactElement => {
	const history = useHistory();
	function navigate(url: string) { history.push(url); }

	ContentFileInfoController.prepData(navigate);

	return (
		<div className="pageGrid">
			<div className="pageTitle"><PageBreadcrumbs /></div>
			{ContentFileInfoController.getToolbar()}
			<div className="pageContent">
				{ContentFileInfoController.getContentPanel()}
			</div>
		</div>
	);
};

export default ContentFileInfo;




module ContentFileInfoController {

	export let pageInfo: Workspaces.WorkspacePageInfo = null;
	export let fileDetails: Workspaces.FileDetails = null;
	export let navigateCallback: (url: string) => void = null;

	export function prepData(navigateCallback: (url: string) => void): void {
		let newPageInfo: Workspaces.WorkspacePageInfo = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo);
		pageInfo = newPageInfo;
		fileDetails = pageInfo?.details;
		ContentFileInfoController.navigateCallback = navigateCallback;
	}

	export function getToolbar(): JSX.Element {
		let commandBarItems: ICommandBarItemProps[] = [];
		let hasRaw: boolean = false;

		switch (fileDetails?.type) {
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

		let farItems: ICommandBarItemProps[] = [
			{ key: "toggleInfo", text: "Toggle file information", iconOnly: true, ariaLabel: "Toggle file information", iconProps: { iconName: "Info" }, onClick: toggleMetaDataPanel }
		];

		return (<div className="pageCommands"><CommandBar items={commandBarItems} farItems={farItems} /></div>);

	}

	function gotoEditor(): void {
		if (navigateCallback != null)
			navigateCallback("/workspace" + fileDetails?.reactLocalUrl + "?action=edit");
	}

	export function getContentPanel(): JSX.Element {

		switch (fileDetails?.type) {
			case Workspaces.FileType.Markdown: {
				return (
					<div className="contentFileDetails">
						<div className="articleContent" dangerouslySetInnerHTML={{ __html: LayoutUtils.fixLocalLinksInHtml(fileDetails.contentHtml, pageInfo?.workspace, pageInfo?.contentItem) }} />
						{getFileMetaDataPanel()}
					</div>
				);
			}
			case Workspaces.FileType.PlainText: {
				return (
					<div className="contentFileDetails">
						<div className="articleContent"><pre className="plainTextFile">{fileDetails.contentText}</pre></div>
						{getFileMetaDataPanel()}
					</div>
				);
			}
		}

		return (
			<div className="contentFileDetails">
				<div className="articleContent">Preview is not supported for this file type</div>
				{getFileMetaDataPanel()}
			</div>
		);
	}


	function toggleMetaDataPanel(): void {
		let show = !Utils.TryGetBool(window, "showFileMetaDataPanel", true);
		window["showFileMetaDataPanel"] = show;
		$(".metaInfo").toggle(show);
	}


	export function getFileMetaDataPanel(): JSX.Element {
		if (fileDetails == null) return null;
		let items: JSX.Element[] = [];

		if (Utils.TrimString(fileDetails.title, null) != null) items.push(<div className="item" key="metaTitle"><b>Title:</b> <span className="value">{fileDetails.title}</span></div>);
		if (Utils.TrimString(fileDetails.url, null) != null) items.push(<div className="item" key="metaUrl"><b>File:</b> <span className="value">{fileDetails.url}</span></div>);
		if (Utils.TrimString(fileDetails.fileSizeDesc, null) != null) items.push(<div className="item" key="metaSize"><b>File size:</b> <span className="value">{fileDetails.fileSizeDesc}</span></div>);

		let panelStyle: React.CSSProperties = {};
		if (!Utils.TryGetBool(window, "showFileMetaDataPanel", true)) panelStyle.display = "none";

		if (items.length > 0)
			return (
				<div className="metaInfo" style={panelStyle}>
					<h2><FontIcon iconName="Info" /> Information</h2>
					{items}
				</div>
				);

		return null;
	}



}



