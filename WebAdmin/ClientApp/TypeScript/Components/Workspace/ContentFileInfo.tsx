import { CommandBar, DefaultButton, Dialog, DialogFooter, DialogType, FontIcon, ICommandBarItemProps, IDialogContentProps, IDialogProps, IModalProps, PrimaryButton, TextField } from '@fluentui/react';
import React, { FC, ReactElement } from 'react';
import { useHistory } from "react-router-dom";
import { useBoolean } from '@fluentui/react-hooks';
import { Utils } from '../../Data/Utils';
import { Workspaces } from '../../Data/Workspaces';
import { LayoutUtils } from '../../LayoutUtils';
import PageBreadcrumbs from './PageBreadcrumbs';
import $ from 'jquery';
import { EventBus } from '../../EventBus';


const ContentFileInfo: FC<{}> = (): ReactElement => {
	const history = useHistory();
	function navigate(url: string) { history.push(url); }

	const [showRenameDialog, { toggle: toggleRenameDialog }] = useBoolean(false);
	const [showMoveDialog, { toggle: toggleMoveDialog }] = useBoolean(false);

	ContentFileInfoController.prepData(navigate, toggleRenameDialog, toggleMoveDialog);

	let renameDialogContent: IDialogContentProps = {
		type: DialogType.largeHeader,
		title: "Rename file"
	};
	let renameDialogModal: IModalProps = { isBlocking: false };

	return (
		<>
			<div className="pageGrid">
				<div className="pageTitle"><PageBreadcrumbs /></div>
				{ContentFileInfoController.getToolbar()}
				<div className="pageContent">
					{ContentFileInfoController.getContentPanel()}
				</div>
			</div>
			<Dialog
				hidden={!showRenameDialog}
				onDismiss={toggleRenameDialog}
				dialogContentProps={renameDialogContent}
				modalProps={renameDialogModal}
			>
				<TextField label="New file name" id="renameInput" defaultValue={ContentFileInfoController?.fileDetails?.fileName} />
				<DialogFooter>
					<PrimaryButton onClick={ContentFileInfoController.Rename.finish} text="Rename" />
					<DefaultButton onClick={ContentFileInfoController.Rename.cancel} text="Cancel" />
				</DialogFooter>
			</Dialog>
		</>
	);
};

export default ContentFileInfo;




module ContentFileInfoController {

	export let pageInfo: Workspaces.WorkspacePageInfo = null;
	export let fileDetails: Workspaces.FileDetails = null;
	let navigateCallback: (url: string) => void = null;
	let toggleRenameDialogCallback: () => void = null;
	let toggleMoveDialogCallback: () => void = null;



	export function prepData(navigate: (
		url: string) => void,
		toggleRenameDialog: () => void,
		toggleMoveDialog: () => void): void {
		let newPageInfo: Workspaces.WorkspacePageInfo = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo);
		pageInfo = newPageInfo;
		fileDetails = pageInfo?.details;
		navigateCallback = navigate;
		toggleRenameDialogCallback = toggleRenameDialog;
		toggleMoveDialogCallback = toggleMoveDialog;
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

		commandBarItems.push({ key: "rename", text: "Rename", onClick: Rename.show, iconProps: { iconName: "Rename" } });
		commandBarItems.push({ key: "move", text: "Move", disabled: true, iconProps: { iconName: "MoveToFolder" } });
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
		let show = !Utils.tryGetBool(window, "showFileMetaDataPanel", true);
		window["showFileMetaDataPanel"] = show;
		$(".metaInfo").toggle(show);
	}


	export function getFileMetaDataPanel(): JSX.Element {
		if (fileDetails == null) return null;
		let items: JSX.Element[] = [];

		if (Utils.trimString(fileDetails.title, null) != null) items.push(<div className="item" key="metaTitle"><b>Title:</b> <span className="value">{fileDetails.title}</span></div>);
		if (Utils.trimString(fileDetails.url, null) != null) items.push(<div className="item" key="metaUrl"><b>File:</b> <span className="value">{fileDetails.url}</span></div>);
		if (Utils.trimString(fileDetails.fileSizeDesc, null) != null) items.push(<div className="item" key="metaSize"><b>File size:</b> <span className="value">{fileDetails.fileSizeDesc}</span></div>);

		let panelStyle: React.CSSProperties = {};
		if (!Utils.tryGetBool(window, "showFileMetaDataPanel", true)) panelStyle.display = "none";

		if (items.length > 0)
			return (
				<div className="metaInfo" style={panelStyle}>
					<h2><FontIcon iconName="Info" /> Information</h2>
					{items}
				</div>
				);

		return null;
	}



	export module Rename {
		export function show(): void {
			toggleRenameDialogCallback();
		}

		export async function finish(): Promise<void> {
			let fileName: string = Utils.trimString($("#renameInput", "").val());
			toggleRenameDialogCallback();
			let response: Workspaces.RenameResponse = await Workspaces.renameFile(fileDetails?.reactLocalUrl, fileName);
			if (response?.success == true) {
				let newUrl: string = Utils.trimString(response?.newUrl, "");
				if (!newUrl.startsWith("/")) newUrl = "/" + newUrl;
				Workspaces.clearTreeCache();
				EventBus.dispatch("fileStructChanged");
				navigateCallback("/workspace" + newUrl);
			}
		}

		export function cancel(): void {
			toggleRenameDialogCallback();
		}
	}


	export module Move {
		export function show(): void {
			toggleMoveDialogCallback();
		}

		export function finish(): void {
			toggleMoveDialogCallback();
		}

		export function cancel(): void {
			toggleMoveDialogCallback();
		}
	}

}



