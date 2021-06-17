import { CommandBar, DefaultButton, Dialog, DialogFooter, DialogType, FontIcon, ICommandBarItemProps, IDialogContentProps, IDialogProps, IModalProps, mergeStyles, PrimaryButton, Spinner, SpinnerSize, Stack, TextField } from '@fluentui/react';
import React, { FC, ReactElement, useState } from 'react';
import { useHistory } from "react-router-dom";
import { useBoolean, IUseBooleanCallbacks } from '@fluentui/react-hooks';
import { Utils } from '../../Data/Utils';
import { Workspaces } from '../../Data/Workspaces';
import { LayoutUtils } from '../../LayoutUtils';
import PageBreadcrumbs from './PageBreadcrumbs';
import $ from 'jquery';
import { EventBus } from '../../EventBus';


const ContentFileInfo: FC<{}> = (): ReactElement => {
	const history = useHistory();
	function navigate(url: string) { history.push(url); }

	const [waitingIsVisible, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting }] = useBoolean(false);
	const [alertIsVisible, { toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert }] = useBoolean(false);
	const [alertTitle, setAlertTitle] = useState("");
	const [alertContent, setAlertContent] = useState("");
	const [renameIsVisible, { toggle: toggleRename, setTrue: showRename, setFalse: hideRename }] = useBoolean(false);
	const [moveIsVisible, { toggle: toggleMove, setTrue: showMove, setFalse: hideMove }] = useBoolean(false);

	ContentFileInfoController.prepData(navigate,
		{ toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting },
		{ toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert, setTitle: setAlertTitle, setContent: setAlertContent },
		{ toggle: toggleRename, setTrue: showRename, setFalse: hideRename },
		{ toggle: toggleMove, setTrue: showMove, setFalse: hideMove });


	return (
		<>
			<div className="pageGrid">
				<div className="pageTitle"><PageBreadcrumbs /></div>
				{ContentFileInfoController.getToolbar()}
				<div className="pageContent">
					{ContentFileInfoController.getContentPanel()}
				</div>
			</div>
			<Dialog hidden={!waitingIsVisible} dialogContentProps={{ type: DialogType.normal, title: null, showCloseButton: false }} modalProps={{ isBlocking: true }} >
				<DialogFooter><Spinner label="Please wait..." labelPosition="right" size={SpinnerSize.large} /></DialogFooter>
			</Dialog>
			<Dialog hidden={!alertIsVisible} dialogContentProps={{ type: DialogType.largeHeader, title: alertTitle }} modalProps={{ isBlocking: false }} onDismiss={hideAlert} >
				<Stack horizontal verticalAlign="center">
					<FontIcon iconName="Warning" className={mergeStyles({ fontSize: 30, width: 30, height: 36, lineHeight: 36, margin: "0 16px 0 0" })} />
					<div>{alertContent}</div>
				</Stack>
				<DialogFooter><PrimaryButton onClick={hideAlert} text="OK" /></DialogFooter>
			</Dialog>
			<Dialog
				hidden={!renameIsVisible}
				onDismiss={hideRename}
				dialogContentProps={{ type: DialogType.largeHeader, title: "Rename file" }}
				modalProps={{ isBlocking: false }}
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

	export interface IAlertDialogOptions extends IUseBooleanCallbacks {
		setTitle: React.Dispatch<React.SetStateAction<string>>,
		setContent: React.Dispatch<React.SetStateAction<string>>
	}

	let navigateCallback: (url: string) => void = null;
	let waitingDialogCallbacks: IUseBooleanCallbacks = null;
	let alertDialogCallbacks: IAlertDialogOptions = null;
	let renameDialogCallbacks: IUseBooleanCallbacks = null;
	let moveDialogCallbacks: IUseBooleanCallbacks = null;


	export function prepData(
		navigate: (url: string) => void,
		waitingDialog: IUseBooleanCallbacks,
		alertDialog: IAlertDialogOptions,
		renameDialog: IUseBooleanCallbacks,
		moveDialog: IUseBooleanCallbacks
	): void {
		let newPageInfo: Workspaces.WorkspacePageInfo = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo);
		pageInfo = newPageInfo;
		fileDetails = pageInfo?.details;

		// UI & React callbacks
		navigateCallback = navigate;
		waitingDialogCallbacks = waitingDialog;
		alertDialogCallbacks = alertDialog;
		renameDialogCallbacks = renameDialog;
		moveDialogCallbacks = moveDialog;
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
			renameDialogCallbacks.setTrue();
		}

		export async function finish(): Promise<void> {
			let fileName: string = Utils.trimString($("#renameInput", "").val());
			renameDialogCallbacks.setFalse();
			waitingDialogCallbacks.setTrue();
			let response: Workspaces.RenameResponse = await Workspaces.renameFile(fileDetails?.reactLocalUrl, fileName);
			waitingDialogCallbacks.setFalse();
			if (response?.actionStatus?.isOk == true) {
				let newUrl: string = Utils.trimString(response?.newUrl, "");
				if (!newUrl.startsWith("/")) newUrl = "/" + newUrl;
				Workspaces.clearTreeCache();
				EventBus.dispatch("fileStructChanged");
				navigateCallback("/workspace" + newUrl);
			} else {
				let title = "Can't rename file";
				let desc = response.actionStatus.getDialogMessage();
				alertDialogCallbacks.setTrue();
				alertDialogCallbacks.setTitle(title);
				alertDialogCallbacks.setContent(desc);
			}
		}

		export function cancel(): void {
			renameDialogCallbacks.setFalse();
		}
	}


	export module Move {
		export function show(): void {
			moveDialogCallbacks.setTrue();
		}

		export function finish(): void {
			moveDialogCallbacks.setFalse();
		}

		export function cancel(): void {
			moveDialogCallbacks.setFalse();
		}
	}


}



