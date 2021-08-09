import { CommandBar, ContextualMenuItemType, DefaultButton, Dialog, DialogFooter, DialogType, Dropdown, ICommandBarItemProps, IDialogContentProps, IDropdownOption, IModalProps, mergeStyles, PrimaryButton, Spinner, SpinnerSize, Stack, TextField } from '@fluentui/react';
import React, { FC, ReactElement, useState } from 'react';
import { useHistory } from "react-router-dom";
import { useBoolean, IUseBooleanCallbacks } from '@fluentui/react-hooks';
import { Utils } from '../../Data/Utils';
import { Workspaces } from '../../Data/Workspaces';
import { LayoutUtils } from '../../LayoutUtils';
import PageBreadcrumbs from './PageBreadcrumbs';
import $ from 'jquery';
import { EventBus } from '../../EventBus';
import { Apis } from '../../Data/Apis';
import { OpenFolderHorizontalIcon, WarningIcon } from '@fluentui/react-icons-mdl2';


const ContentDirectory: FC<{}> = (): ReactElement => {
	const history = useHistory();
	function navigate(url: string) { history.push(url); }



	//#region Dialog callbacks

	// Waiting dialog
	const [waitingIsVisible, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting }] = useBoolean(false);

	// Alert
	const [alertIsVisible, { toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert }] = useBoolean(false);
	const [alertTitle, setAlertTitle] = useState("");
	const [alertContent, setAlertContent] = useState("");

	// Rename directory
	const [renameIsVisible, { toggle: toggleRename, setTrue: showRename, setFalse: hideRename }] = useBoolean(false);

	// Move directory
	const [moveIsVisible, { toggle: toggleMove, setTrue: showMove, setFalse: hideMove }] = useBoolean(false);
	const [moveDirectories, setMoveDirectories] = useState<IDropdownOption[]>([]);

	// Create new file/directory
	const [createIsVisible, { toggle: toggleCreate, setTrue: showCreate, setFalse: hideCreate }] = useBoolean(false);
	const [createLabel, setCreateLabel] = useState("");
	const [createSuffix, setCreateSuffix] = useState("");
	const [createContent, setCreateContent] = useState<IDialogContentProps>({});

	// Delete directory
	const [deleteIsVisible, { toggle: toggleDelete, setTrue: showDelete, setFalse: hideDelete }] = useBoolean(false);

	// Upload
	const [uploadOverwriteMixedIsVisible, { toggle: toggleUploadOverwriteMixed, setTrue: showUploadOverwriteMixed, setFalse: hideUploadOverwriteMixed }] = useBoolean(false);
	const [uploadOverwriteIsVisible, { toggle: toggleUploadOverwrite, setTrue: showUploadOverwrite, setFalse: hideUploadOverwrite }] = useBoolean(false);
	//const [uploadHasAnyNewFiles, setUploadHasAnyNewFiles] = useState(true);

	//#endregion



	// Initialize controller & prepare relevant data
	ContentDirectoryController.prepData(navigate,
		{ toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting },
		{ toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert, setTitle: setAlertTitle, setContent: setAlertContent },
		{ toggle: toggleRename, setTrue: showRename, setFalse: hideRename },
		{ toggle: toggleMove, setTrue: showMove, setFalse: hideMove, setDirectories: setMoveDirectories },
		{ toggle: toggleCreate, setTrue: showCreate, setFalse: hideCreate, setLabel: setCreateLabel, setSuffix: setCreateSuffix, setContent: setCreateContent },
		{ toggle: toggleDelete, setTrue: showDelete, setFalse: hideDelete },
		{ showOverwriteMixed: showUploadOverwriteMixed, hideOverwriteMixed: hideUploadOverwriteMixed, showOverwrite: showUploadOverwrite, hideOverwrite: hideUploadOverwrite });


	return (
		<>
			{/* Page content */}
			<div className="pageGrid">
				<div className="pageTitle"><PageBreadcrumbs /></div>
				{ContentDirectoryController.getToolbar()}
				<div className="pageContent">
					<div className="emptyPage">
						<div className="watermark"><OpenFolderHorizontalIcon /></div>
					</div>
				</div>
			</div>

			{/* Waiting dialog */}
			<Dialog hidden={!waitingIsVisible} dialogContentProps={{ type: DialogType.normal, title: null, showCloseButton: false }} modalProps={{ isBlocking: true }} >
				<DialogFooter><Spinner label="Please wait..." labelPosition="right" size={SpinnerSize.large} /></DialogFooter>
			</Dialog>

			{/* Alert dialog */}
			<Dialog hidden={!alertIsVisible} dialogContentProps={{ type: DialogType.largeHeader, title: alertTitle }} modalProps={{ isBlocking: false }} onDismiss={hideAlert} >
				<Stack horizontal verticalAlign="center">
					<WarningIcon className={mergeStyles({ fontSize: 30, width: 30, height: 36, lineHeight: 36, margin: "0 16px 0 0" })} />
					<div>{alertContent}</div>
				</Stack>
				<DialogFooter><PrimaryButton onClick={hideAlert} text="OK" /></DialogFooter>
			</Dialog>

			{/* Rename dialog */}
			<Dialog
				hidden={!renameIsVisible}
				onDismiss={hideRename}
				dialogContentProps={{ type: DialogType.largeHeader, title: "Rename folder" }}
				modalProps={{ isBlocking: false }}
			>
				<TextField label="New folder name" id="renameInput" defaultValue={ContentDirectoryController?.pageInfo?.contentItem?.name} />
				<DialogFooter>
					<PrimaryButton onClick={ContentDirectoryController.Rename.finish} text="Rename" />
					<DefaultButton onClick={ContentDirectoryController.Rename.cancel} text="Cancel" />
				</DialogFooter>
			</Dialog>

			{/* Move dialog */}
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

			{/* Create file/directory dialog */}
			<Dialog
				hidden={!createIsVisible}
				onDismiss={hideCreate}
				dialogContentProps={createContent}
				modalProps={{ isBlocking: false }}
			>
				<TextField label={createLabel} id="createInput" defaultValue="" suffix={createSuffix} />
				<DialogFooter>
					<PrimaryButton onClick={ContentDirectoryController.CreateItem.finish} text="Create" />
					<DefaultButton onClick={ContentDirectoryController.CreateItem.cancel} text="Cancel" />
				</DialogFooter>
			</Dialog>

			{/* Delete dialog */}
			<Dialog
				hidden={!deleteIsVisible}
				onDismiss={hideDelete}
				dialogContentProps={{ type: DialogType.largeHeader, title: "Delete folder", subText: "Delete this folder?" }}
				modalProps={{ isBlocking: false }}
			>
				<DialogFooter>
					<PrimaryButton onClick={ContentDirectoryController.Delete.finish} text="Delete" />
					<DefaultButton onClick={ContentDirectoryController.Delete.cancel} text="Cancel" />
				</DialogFooter>
			</Dialog>


			{/* Upload controls */}
			<input id="uploadFileInput" type="file" className="invisibleUploadInput" onChange={ContentDirectoryController.Upload.onUploadSelection} multiple={true} />
			<Dialog
				hidden={!uploadOverwriteMixedIsVisible}
				onDismiss={ContentDirectoryController.Upload.closeAndReset}
				dialogContentProps={{
					type: DialogType.largeHeader, title: "Files already exist",
					subText: "Would you like to upload all files and overwrite existing, or upload only new files?"
				}}
				modalProps={{ isBlocking: false }}
			>
				<DialogFooter>
					<PrimaryButton onClick={ContentDirectoryController.Upload.uploadAndOverwrite} text="All" />
					<PrimaryButton onClick={ContentDirectoryController.Upload.uploadNewFiles} text="Only new" />
					<DefaultButton onClick={ContentDirectoryController.Upload.closeAndReset} text="Cancel" />
				</DialogFooter>
			</Dialog>
			<Dialog
				hidden={!uploadOverwriteIsVisible}
				onDismiss={ContentDirectoryController.Upload.closeAndReset}
				dialogContentProps={{
					type: DialogType.largeHeader, title: "Files already exist",
					subText: "Would you like to overwrite existing files?"
				}}
				modalProps={{ isBlocking: false }}
			>
				<DialogFooter>
					<PrimaryButton onClick={ContentDirectoryController.Upload.uploadAndOverwrite} text="Overwrite" />
					<DefaultButton onClick={ContentDirectoryController.Upload.closeAndReset} text="Cancel" />
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

	let navigateCallback: (url: string) => void = null;
	let waitingDialogCallbacks: IUseBooleanCallbacks = null;
	let alertDialogCallbacks: IAlertDialogOptions = null;


	export function prepData(
		navigate: (url: string) => void,
		waitingDialog: IUseBooleanCallbacks,
		alertDialog: IAlertDialogOptions,
		renameDialog: IUseBooleanCallbacks,
		moveDialog: Move.IMoveDialogOptions,
		createDialog: CreateItem.ICreateDialogOptions,
		deleteDialog: IUseBooleanCallbacks,
		uploadDialog: Upload.IUploadCallbacks
	): void {
		let newPageInfo: Workspaces.WorkspacePageInfo = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo);
		pageInfo = newPageInfo;

		// UI & React callbacks
		navigateCallback = navigate;
		waitingDialogCallbacks = waitingDialog;
		alertDialogCallbacks = alertDialog;
		Rename.callbacks = renameDialog;
		Move.callbacks = moveDialog;
		CreateItem.callbacks = createDialog;
		Delete.callbacks = deleteDialog;
		Upload.callbacks = uploadDialog;

		let directoryUrl = Utils.padWithSlash(Utils.tryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo), ["contentItem", "url"]));
		isRoot = (directoryUrl == "/");

		Move.prep();
	}




	export function getToolbar(): JSX.Element {
		let commandBarItems: ICommandBarItemProps[] = [
			{
				key: "newItem", text: "New", iconProps: { iconName: "Add" },
				subMenuProps: {
					items: [
						{ key: "newMarkdown", text: "Markdown file", onClick: ContentDirectoryController.CreateItem.createMarkdown, iconProps: { iconName: "MarkDownLanguage" } },
						{ key: "newText", text: "Text file", onClick: ContentDirectoryController.CreateItem.createPlainText, iconProps: { iconName: "TextDocument" } },
						{ key: 'divider', name: '-', itemType: ContextualMenuItemType.Divider },
						{ key: "newDirectory", text: "Folder", onClick: ContentDirectoryController.CreateItem.createDirectory, iconProps: { iconName: "FolderHorizontal" } }
					]
				}
			},
			{ key: "upload", text: "Upload", onClick: Upload.startSelection, iconProps: { iconName: "Upload" } }
		];

		if (!isRoot) {
			commandBarItems.push({ key: "rename", text: "Rename", onClick: Rename.show, iconProps: { iconName: "Rename" } });
			commandBarItems.push({ key: "move", text: "Move", onClick: Move.show, iconProps: { iconName: "MoveToFolder" } });
			commandBarItems.push({ key: "delete", text: "Delete", onClick: Delete.show, iconProps: { iconName: "Delete" } });
		}

		return (<div className="pageCommands"><CommandBar items={commandBarItems} /></div>);

	}





	export module Rename {
		export let callbacks: IUseBooleanCallbacks = null;

		export function show(): void {
			callbacks.setTrue();
		}

		export async function finish(): Promise<void> {
			let fileName: string = Utils.trimString($("#renameInput", "").val());
			callbacks.setFalse();
			waitingDialogCallbacks.setTrue();
			let response: Workspaces.MoveResponse = await Workspaces.renameDirectory(pageInfo?.contentItem?.reactLocalUrl, fileName);
			waitingDialogCallbacks.setFalse();
			if (response?.actionStatus?.isOk == true) {
				let newUrl: string = Utils.padWithSlash(Utils.trimString(response?.newUrl, ""), true, false);
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
			callbacks.setFalse();
		}
	}


	export module Move {
		export interface IMoveDialogOptions extends IUseBooleanCallbacks {
			setDirectories: React.Dispatch<React.SetStateAction<IDropdownOption[]>>
		}
		export let callbacks: IMoveDialogOptions = null;

		let pathOptions: IDropdownOption[] = null;
		let currentSelection: string = null;
		let lastPageUrl: string = null;

		export function prep(): void {
			if (lastPageUrl != pageInfo?.contentItem?.reactLocalUrl) {
				pathOptions = null;
			}
			lastPageUrl = pageInfo?.contentItem?.reactLocalUrl;
		}

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
				let thisPath = Utils.padWithSlash(pageInfo?.contentItem?.url, false, true);
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

			callbacks.setDirectories(pathOptions);
			currentSelection = pageInfo.contentItem.getParentPath();
			callbacks.setTrue();
		}

		export async function finish(): Promise<void> {
			let newParent: string = currentSelection;
			callbacks.setFalse();
			waitingDialogCallbacks.setTrue();
			let response: Workspaces.MoveResponse = await Workspaces.moveDirectory(pageInfo?.contentItem?.reactLocalUrl, newParent);
			waitingDialogCallbacks.setFalse();
			if (response?.actionStatus?.isOk == true) {
				let newUrl: string = Utils.padWithSlash(Utils.trimString(response?.newUrl, ""), true, false);
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
			callbacks.setFalse();
		}

		export function onSelectionChange(event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number): void {
			currentSelection = Utils.parseString(option?.key);
		}
	}


	export module CreateItem {
		export interface ICreateDialogOptions extends IUseBooleanCallbacks {
			setLabel: React.Dispatch<React.SetStateAction<string>>,
			setSuffix: React.Dispatch<React.SetStateAction<string>>,
			setContent: React.Dispatch<React.SetStateAction<IDialogContentProps>>,
		}
		export let callbacks: ICreateDialogOptions = null;

		let currentItemType: Workspaces.ContentItemType;
		let title: string = null;
		let label: string = null;
		let suffix: string = null;

		export function createMarkdown(): void {
			currentItemType = Workspaces.ContentItemType.File;
			title = "New Markdown file";
			label = "File name:";
			suffix = ".md";
			show();
		}

		export function createPlainText(): void {
			currentItemType = Workspaces.ContentItemType.File;
			title = "New plain text file";
			label = "File name:";
			suffix = ".txt";
			show();
		}

		export function createDirectory(): void {
			currentItemType = Workspaces.ContentItemType.Directory;
			title = "New directory";
			label = "Directory name:";
			suffix = undefined;
			show();
		}

		function show(): void {
			callbacks.setLabel(label);
			callbacks.setContent({ title: title });
			callbacks.setSuffix(suffix);
			callbacks.setTrue();
		}

		export async function finish(): Promise<void> {
			let fileNameBase = Utils.trimString($("#createInput", "").val());
			callbacks.setFalse();
			if (!(fileNameBase?.length > 0)) return; // No file name specified
			let fileName: string = fileNameBase + Utils.trimString(suffix, "");
			waitingDialogCallbacks.setTrue();
			let response: Apis.DataWithStatus<Workspaces.ContentItem> = null;
			switch (currentItemType) {
				case Workspaces.ContentItemType.File: { response = await Workspaces.createFile(pageInfo?.contentItem?.reactLocalUrl, fileName); break; }
				case Workspaces.ContentItemType.Directory: { response = await Workspaces.createDirectory(pageInfo?.contentItem?.reactLocalUrl, fileName); break; }
			}
			waitingDialogCallbacks.setFalse();
			if (response?.actionStatus?.isOk == true) {
				let newUrl: string = Utils.trimString(response?.data?.reactLocalUrl, "");
				Workspaces.clearTreeCache();
				EventBus.dispatch("fileStructChanged");
				navigateCallback("/workspace" + newUrl);
			} else {
				let title = "Can't create item";
				switch (currentItemType) {
					case Workspaces.ContentItemType.File: { title = "Can't create file"; break; }
					case Workspaces.ContentItemType.Directory: { title = "Can't create folder"; break; }
				}
				let desc = response.actionStatus.getDialogMessage();
				alertDialogCallbacks.setTrue();
				alertDialogCallbacks.setTitle(title);
				alertDialogCallbacks.setContent(desc);
			}
		}

		export function cancel(): void {
			callbacks.setFalse();
		}

	}


	export module Delete {
		export let callbacks: IUseBooleanCallbacks = null;

		export function show(): void {
			callbacks.setTrue();
		}

		export async function finish(): Promise<void> {
			let fileName: string = Utils.trimString($("#renameInput", "").val());
			callbacks.setFalse();
			waitingDialogCallbacks.setTrue();
			let response: Workspaces.DeleteItemResponse = await Workspaces.deleteItem(pageInfo?.contentItem?.reactLocalUrl);
			waitingDialogCallbacks.setFalse();
			if (response?.actionStatus?.isOk == true) {
				let parentUrl: string = Utils.padWithSlash(Utils.trimString(response?.parentReactLocalUrl, ""), true, false);
				Workspaces.clearTreeCache();
				EventBus.dispatch("fileStructChanged");
				navigateCallback("/workspace" + parentUrl);
			} else {
				let title = "Can't delete folder";
				let desc = response.actionStatus.getDialogMessage();
				alertDialogCallbacks.setTrue();
				alertDialogCallbacks.setTitle(title);
				alertDialogCallbacks.setContent(desc);
			}
		}

		export function cancel(): void {
			callbacks.setFalse();
		}
	}


	export module Upload {

		/*
		 * Upload sequence:
		 * 1. Select files (triggered from menu)
		 * 2. Pre-check - check if files already exist
		 * 3. If any conflicts, ask whether to skip or overwrite these files
		 * 4. Upload non-conflicted or all files
		 * 5. Refresh navigation (file structure)
		 */

		export interface IUploadCallbacks {
			showOverwriteMixed: () => void,
			hideOverwriteMixed: () => void,
			showOverwrite: () => void,
			hideOverwrite: () => void,
			//setHasAnyNewFiles: React.Dispatch<React.SetStateAction<boolean>>
		}
		export let callbacks: IUploadCallbacks = null;


		let files: FileList = null;
		let conflictedFiles: string[] = null;
		let hasAnyConflicts: boolean = false;
		let hasAnyNewFiles: boolean = false;
		let wasAnythingUploaded: boolean = false;
		let issues: string[] = null;

		export function reset(): void {
			files = null;
			hasAnyConflicts = false;
			hasAnyNewFiles = false;
			conflictedFiles = [];
			wasAnythingUploaded = false;
			issues = null;
		}

		export function startSelection(): void {
			$("#uploadFileInput").trigger("click");
		}

		export function onUploadSelection(e: any): void {
			files = Utils.tryGet(e, ["target", "files"]);
			startProcess();
		}

		async function startProcess(): Promise<void> {
			try {
				if ((files == null) || (files.length <= 0)) {
					reset();
				}

				waitingDialogCallbacks.setTrue();
				// First check for conflicts
				preCheck();
			}
			catch (e) {
				reset();
			}
		}


		async function preCheck(): Promise<void> {
			hasAnyConflicts = false;
			hasAnyNewFiles = false;
			conflictedFiles = [];

			let request: Workspaces.PreUploadCheck.Request = null;

			//#region Prepare request data
			{
				let clientFiles: Workspaces.PreUploadCheck.ClientFile[] = [];
				try {
					if (files != null) {
						for (let x = 0; x < files.length; x++) {
							clientFiles.push(new Workspaces.PreUploadCheck.ClientFile(files[x]?.name));
						}
					}
				} catch (e) { }
				request = new Workspaces.PreUploadCheck.Request(pageInfo?.contentItem?.reactLocalUrl, clientFiles);
			}
			//#endregion

			// Fetch from server
			let response = await Workspaces.PreUploadCheck.check(request);

			//#region Process response
			if (Utils.arrayHasValues(response?.files)) {
				for (let x = 0; x < response.files.length; x++) {
					let file = response.files[x];
					if (file == null) continue;
					switch (file.status) {
						case Workspaces.PreUploadCheck.FileStatusType.AlreadyExists: {
							conflictedFiles.push()
							hasAnyConflicts = true;
							break;
						}
						case Workspaces.PreUploadCheck.FileStatusType.OK: {
							hasAnyNewFiles = true;
							break;
						}
					}
				}
			}
			//#endregion


			//#region There are conflicts: Ask what to do
			if (hasAnyConflicts) {
				//callbacks.setHasAnyNewFiles(hasAnyNewFiles);
				if (hasAnyNewFiles)
					callbacks.showOverwriteMixed();
				else
					callbacks.showOverwrite();
				return;
			}
			//#endregion


			//#region Ony new files
			if ((!hasAnyConflicts) && (hasAnyNewFiles)) {
				uploadNewFiles();
				return;
			}
			//#endregion

			// Nothing to upload
			reset();
		}

		//function getFileList(): File[] {
		//	let list: File[] = [];
		//	if (files?.length > 0) {
		//		for (let x = 0; x < files.length; x++) {
		//			list.push(files[x]);
		//		}
		//	}
		//	return list;
		//}

		export async function uploadAndOverwrite(): Promise<void> {
			await uploadSelected(files);
			wrapUp();
		}

		export async function uploadNewFiles(): Promise<void> {
			let list: File[] = [];
			if (files?.length > 0) {
				for (let x = 0; x < files.length; x++) {
					let file = files[x];
					if (conflictedFiles?.includes(file.name) != true)
						list.push(file);
				}
			}
			await uploadSelected(list);
			wrapUp();
		}

		async function uploadSelected(filesForUpload: File[] | FileList): Promise<void> {
			if (issues == null) issues = [];
			try {
				if (filesForUpload?.length > 0) {
					for (let x = 0; x < filesForUpload.length; x++) {
						let response = await Workspaces.uploadFile(pageInfo?.contentItem?.reactLocalUrl, filesForUpload[x]);
						if (response?.actionStatus != null) {
							if (response.actionStatus.isOk) {
								wasAnythingUploaded = true;
								Workspaces.clearTreeCache();
								EventBus.dispatch("fileStructChanged");
							} else {
								let issue: string = filesForUpload[x].name + ": " + response.actionStatus.getDialogMessage();
								issues.push(issue);
							}
						}
					}
				}
			}
			catch (e) { }
		}


		function wrapUp(): void {
			let issuesText = null;
			let issueCount = 0;
			let uploadedAnything = wasAnythingUploaded;
			if (Utils.arrayHasValues(issues)) {
				issuesText = issues.join("\n");
				issueCount = issues.length;
			}
			closeAndReset();
			if ((issuesText != null) && (issueCount > 0)) {
				let title = uploadedAnything ? "Can't upload everything" : "Can't upload";
				alertDialogCallbacks.setTrue();
				alertDialogCallbacks.setTitle(title);
				alertDialogCallbacks.setContent(issuesText);
			}
		}


		export function closeAndReset(): void {
			reset();
			waitingDialogCallbacks.setFalse();
			callbacks.hideOverwriteMixed();
			callbacks.hideOverwrite();
		}

	}


}

