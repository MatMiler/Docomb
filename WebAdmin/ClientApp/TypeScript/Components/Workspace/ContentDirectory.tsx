import { CommandBar, ContextualMenuItemType, DefaultButton, Dialog, DialogFooter, DialogType, Dropdown, FontIcon, ICommandBarItemProps, IDialogContentProps, IDropdownOption, IModalProps, mergeStyles, PrimaryButton, Spinner, SpinnerSize, Stack, TextField } from '@fluentui/react';
import React, { FC, ReactElement, useState } from 'react';
import { useHistory } from "react-router-dom";
import { useBoolean, IUseBooleanCallbacks } from '@fluentui/react-hooks';
import { Utils } from '../../Data/Utils';
import { Workspaces } from '../../Data/Workspaces';
import { LayoutUtils } from '../../LayoutUtils';
import PageBreadcrumbs from './PageBreadcrumbs';
import $ from 'jquery';
import { EventBus } from '../../EventBus';


const ContentDirectory: FC<{}> = (): ReactElement => {
	const history = useHistory();
	function navigate(url: string) { history.push(url); }

	const [waitingIsVisible, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting }] = useBoolean(false);
	const [alertIsVisible, { toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert }] = useBoolean(false);
	const [alertTitle, setAlertTitle] = useState("");
	const [alertContent, setAlertContent] = useState("");
	const [renameIsVisible, { toggle: toggleRename, setTrue: showRename, setFalse: hideRename }] = useBoolean(false);
	const [moveIsVisible, { toggle: toggleMove, setTrue: showMove, setFalse: hideMove }] = useBoolean(false);
	const [moveDirectories, setMoveDirectories] = useState<IDropdownOption[]>([]);

	ContentDirectoryController.prepData(navigate,
		{ toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting },
		{ toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert, setTitle: setAlertTitle, setContent: setAlertContent },
		{ toggle: toggleRename, setTrue: showRename, setFalse: hideRename },
		{ toggle: toggleMove, setTrue: showMove, setFalse: hideMove, setDirectories: setMoveDirectories });

	let renameDialogContent: IDialogContentProps = {
		type: DialogType.largeHeader,
		title: "Rename folder"
	};
	let renameDialogModal: IModalProps = { isBlocking: false };


	return (
		<>
			<div className="pageGrid">
				<div className="pageTitle"><PageBreadcrumbs /></div>
				{ContentDirectoryController.getToolbar()}
				<div className="pageContent">
					<div className="emptyPage">
						<div className="watermark"><FontIcon iconName={ContentDirectoryController.isRoot ? "ProjectCollection" : "OpenFolderHorizontal"} /></div>
					</div>
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
				dialogContentProps={renameDialogContent}
				modalProps={renameDialogModal}
			>
				<TextField label="New folder name" id="renameInput" defaultValue={ContentDirectoryController?.pageInfo?.contentItem?.name} />
				<DialogFooter>
					<PrimaryButton onClick={ContentDirectoryController.Rename.finish} text="Rename" />
					<DefaultButton onClick={ContentDirectoryController.Rename.cancel} text="Cancel" />
				</DialogFooter>
			</Dialog>
			<Dialog
				hidden={!moveIsVisible}
				onDismiss={hideMove}
				dialogContentProps={{ type: DialogType.largeHeader, title: "Move file" }}
				modalProps={{ isBlocking: false }}
			>
				<Dropdown id="moveInput" placeholder="Select a folder" label="Move to folder" defaultSelectedKey={ContentDirectoryController.pageInfo.contentItem.getParentPath()} options={moveDirectories} onChange={ContentDirectoryController.Move.onSelectionChange} />
				<DialogFooter>
					<PrimaryButton onClick={ContentDirectoryController.Move.finish} text="Move" />
					<DefaultButton onClick={ContentDirectoryController.Move.cancel} text="Cancel" />
				</DialogFooter>
			</Dialog>
		</>
	);
};

export default ContentDirectory;






module ContentDirectoryController {
	export let pageInfo: Workspaces.WorkspacePageInfo = null;
	export let isRoot = false;

	export interface IAlertDialogOptions extends IUseBooleanCallbacks {
		setTitle: React.Dispatch<React.SetStateAction<string>>,
		setContent: React.Dispatch<React.SetStateAction<string>>
	}
	export interface IMoveDialogOptions extends IUseBooleanCallbacks {
		setDirectories: React.Dispatch<React.SetStateAction<IDropdownOption[]>>
	}

	let navigateCallback: (url: string) => void = null;
	let waitingDialogCallbacks: IUseBooleanCallbacks = null;
	let alertDialogCallbacks: IAlertDialogOptions = null;
	let renameDialogCallbacks: IUseBooleanCallbacks = null;
	let moveDialogCallbacks: IMoveDialogOptions = null;



	export function prepData(
		navigate: (url: string) => void,
		waitingDialog: IUseBooleanCallbacks,
		alertDialog: IAlertDialogOptions,
		renameDialog: IUseBooleanCallbacks,
		moveDialog: IMoveDialogOptions
	): void {
		let newPageInfo: Workspaces.WorkspacePageInfo = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo);
		pageInfo = newPageInfo;

		// UI & React callbacks
		navigateCallback = navigate;
		waitingDialogCallbacks = waitingDialog;
		alertDialogCallbacks = alertDialog;
		renameDialogCallbacks = renameDialog;
		moveDialogCallbacks = moveDialog;

		let directoryUrl = Utils.tryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo), ["contentItem", "url"]);
		if (!directoryUrl.startsWith("/")) directoryUrl = "/" + directoryUrl;
		if (!directoryUrl.endsWith("/")) directoryUrl += "/";
		isRoot = (directoryUrl == "/");

	}




	export function getToolbar(): JSX.Element {
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

		if (!isRoot) {
			commandBarItems.push({ key: "rename", text: "Rename", onClick: Rename.show, iconProps: { iconName: "Rename" } });
			commandBarItems.push({ key: "move", text: "Move", onClick: Move.show, iconProps: { iconName: "MoveToFolder" } });
			commandBarItems.push({ key: "delete", text: "Delete", disabled: true, iconProps: { iconName: "Delete" } });
		}

		return (<div className="pageCommands"><CommandBar items={commandBarItems} /></div>);

	}





	export module Rename {
		export function show(): void {
			renameDialogCallbacks.setTrue();
		}

		export async function finish(): Promise<void> {
			let fileName: string = Utils.trimString($("#renameInput", "").val());
			renameDialogCallbacks.setFalse();
			waitingDialogCallbacks.setTrue();
			let response: Workspaces.MoveResponse = await Workspaces.renameDirectory(pageInfo?.contentItem?.reactLocalUrl, fileName);
			waitingDialogCallbacks.setFalse();
			if (response?.actionStatus?.isOk == true) {
				let newUrl: string = Utils.trimString(response?.newUrl, "");
				if (!newUrl.startsWith("/")) newUrl = "/" + newUrl;
				Workspaces.clearTreeCache();
				EventBus.dispatch("fileStructChanged");
				navigateCallback("/workspace" + newUrl);
			} else {
				let title = "Can't rename folder";
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

		let pathOptions: IDropdownOption[] = null;
		let currentSelection: string = null;

		export function show(): void { showAsync(); }
		export async function showAsync(): Promise<void> {

			//#region Get path list options
			if (pathOptions == null) {
				waitingDialogCallbacks.setTrue();
				let response = await Workspaces.directoryPaths(pageInfo.workspace.url);
				if (response?.actionStatus?.isOk != true) {
					waitingDialogCallbacks.setFalse();
					let title = "Can't get folder list";
					let desc = response.actionStatus.getDialogMessage();
					alertDialogCallbacks.setTrue();
					alertDialogCallbacks.setTitle(title);
					alertDialogCallbacks.setContent(desc);
					return;
				}
				let options: IDropdownOption[] = [{ key: "/", text: "/" }];
				let thisPath = pageInfo?.contentItem?.url;
				if (!thisPath.endsWith("/")) thisPath += "/";
				if (Utils.arrayHasValues(response?.data)) {
					for (let x = 0; x < response.data.length; x++) {
						let path = response.data[x];
						if ((path.startsWith(thisPath)) || (path == thisPath)) continue;
						options.push({ key: path, text: path });
					}
				}
				pathOptions = options;
				waitingDialogCallbacks.setFalse();
			}
			//#endregion

			moveDialogCallbacks.setDirectories(pathOptions);
			currentSelection = pageInfo.contentItem.getParentPath();
			moveDialogCallbacks.setTrue();
		}

		export async function finish(): Promise<void> {
			let newParent: string = currentSelection;
			moveDialogCallbacks.setFalse();
			waitingDialogCallbacks.setTrue();
			let response: Workspaces.MoveResponse = await Workspaces.moveDirectory(pageInfo?.contentItem?.reactLocalUrl, newParent);
			waitingDialogCallbacks.setFalse();
			if (response?.actionStatus?.isOk == true) {
				let newUrl: string = Utils.trimString(response?.newUrl, "");
				if (!newUrl.startsWith("/")) newUrl = "/" + newUrl;
				Workspaces.clearTreeCache();
				EventBus.dispatch("fileStructChanged");
				navigateCallback("/workspace" + newUrl);
			} else {
				let title = "Can't move folder";
				let desc = response.actionStatus.getDialogMessage();
				alertDialogCallbacks.setTrue();
				alertDialogCallbacks.setTitle(title);
				alertDialogCallbacks.setContent(desc);
			}
		}

		export function cancel(): void {
			moveDialogCallbacks.setFalse();
		}

		export function onSelectionChange(event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number): void {
			currentSelection = Utils.parseString(option?.key);
		}
	}

}


