import { CommandBar, Dialog, DialogFooter, DialogType, FontIcon, ICommandBarItemProps, mergeStyles, PrimaryButton, Spinner, SpinnerSize, Stack, TextField } from "@fluentui/react";
import React, { FC, ReactElement, useState } from "react";
import { useHistory } from "react-router-dom";
import { useBoolean, IUseBooleanCallbacks } from '@fluentui/react-hooks';
import { Utils } from "../../Data/Utils";
import { Workspaces } from "../../Data/Workspaces";
import { LayoutUtils } from "../../LayoutUtils";
import PageBreadcrumbs from "./PageBreadcrumbs";
import $ from 'jquery';
import { Apis } from "../../Data/Apis";


const EditTextFile: FC<{}> = (): ReactElement => {
	const history = useHistory();
	function navigate(url: string) { history.push(url); }

	const [waitingIsVisible, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting }] = useBoolean(false);
	const [alertIsVisible, { toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert }] = useBoolean(false);
	const [alertTitle, setAlertTitle] = useState("");
	const [alertContent, setAlertContent] = useState("");

	EditTextFileController.prepData(navigate,
		{ toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting },
		{ toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert, setTitle: setAlertTitle, setContent: setAlertContent });

	return (
		<>
			<div className="pageGrid">
				<div className="pageTitle"><PageBreadcrumbs /></div>
				{EditTextFileController.getToolbar()}
				<div className="pageContent">
					{EditTextFileController.getContentPanel()}
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
		</>
	);
};

export default EditTextFile;


module EditTextFileController {

	export let pageInfo: Workspaces.WorkspacePageInfo = null;
	export let fileDetails: Workspaces.FileDetails = null;
	let content: string = null;

	export interface IAlertDialogOptions extends IUseBooleanCallbacks {
		setTitle: React.Dispatch<React.SetStateAction<string>>,
		setContent: React.Dispatch<React.SetStateAction<string>>
	}

	export let navigateCallback: (url: string) => void = null;
	let waitingDialogCallbacks: IUseBooleanCallbacks = null;
	let alertDialogCallbacks: IAlertDialogOptions = null;

	export function prepData(
		navigate: (url: string) => void,
		waitingDialog: IUseBooleanCallbacks,
		alertDialog: IAlertDialogOptions
	): void {
		let newPageInfo: Workspaces.WorkspacePageInfo = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo);
		pageInfo = newPageInfo;
		fileDetails = pageInfo?.details;
		content = fileDetails?.contentText;

		EditTextFileController.navigateCallback = navigate;
		waitingDialogCallbacks = waitingDialog;
		alertDialogCallbacks = alertDialog;
	}


	export function getToolbar(): JSX.Element {
		let commandBarItems: ICommandBarItemProps[] = [];
		let farItems: ICommandBarItemProps[] = [];
		let hasPreview = false;


		commandBarItems.push({ key: "save", text: "Save", onClick: save, iconProps: { iconName: "Save" } });
		commandBarItems.push({ key: "cancel", text: "Cancel & close", onClick: gotoInfo, iconProps: { iconName: "Cancel" } });

		switch (fileDetails?.type) {
			case Workspaces.FileType.Markdown: { hasPreview = true; break; }
			case Workspaces.FileType.Html: { hasPreview = true; break; }
			//case Workspaces.FileType.PlainText: { hasPreview = false; break; }
		}

		//if (hasPreview) {
		//	//commandBarItems.push({ key: "preview", text: "Preview", iconProps: { iconName: "Preview" } });
		//	farItems.push({ key: "togglePreview", text: "Toggle preview", iconOnly: true, ariaLabel: "Toggle preview", iconProps: { iconName: "View" }, onClick: togglePreviewPanel });
		//}

		return (<div className="pageCommands"><CommandBar items={commandBarItems} farItems={farItems} /></div>);
	}


	function gotoInfo(): void {
		if (navigateCallback != null)
			navigateCallback("/workspace" + fileDetails?.reactLocalUrl);
	}

	function save(): void { saveAsync(); }
	async function saveAsync(): Promise<void> {
		waitingDialogCallbacks.setTrue();
		let c = Utils.parseString($("#editorInput").val(), content);
		let response = null;
		response = await Apis.postJsonAsync("api/content/saveTextFile", { url: fileDetails?.reactLocalUrl, textContent: c });
		waitingDialogCallbacks.setFalse();
		let status = new Apis.ActionStatus(response);
		if (status?.isOk == true) {
			gotoInfo();
		} else {
			let title = "Can't save changes";
			let desc = status.getDialogMessage();
			alertDialogCallbacks.setTrue();
			alertDialogCallbacks.setTitle(title);
			alertDialogCallbacks.setContent(desc);
		}
	}

	function onSaveSuccess(response: any): void {
		gotoInfo();
		waitingDialogCallbacks.setFalse();
	}

	function onSaveError(): void {
		waitingDialogCallbacks.setFalse();
	}

	export function getContentPanel(): JSX.Element {
		let previewStyle: React.CSSProperties = {};
		if (!Utils.tryGetBool(window, "showFileMetaDataPanel", true)) previewStyle.display = "none";

		switch (fileDetails?.type) {
			case Workspaces.FileType.Markdown: {
				return (
					<div className="editTextFile">
						<div className="editor"><TextField id="editorInput" defaultValue={fileDetails?.contentText} multiline resizable={false} borderless onChange={onEditorChange} /></div>
					{/*	<div className="preview">*/}
					{/*		<div id="previewContainer" className="articleContent" style={previewStyle}*/}
					{/*			dangerouslySetInnerHTML={{ __html: LayoutUtils.fixLocalLinksInHtml(fileDetails.contentHtml, pageInfo?.workspace, pageInfo?.contentItem) }} />*/}
					{/*	</div>*/}
					</div>
				);
			}
			case Workspaces.FileType.Html: case Workspaces.FileType.PlainText: {
				return (
					<div className="editTextFile">
						<div className="editor"><TextField id="editorInput" defaultValue={fileDetails?.contentText} multiline resizable={false} borderless onChange={onEditorChange} /></div>
					</div>
				);
			}
		}

		return (
			<div className="editTextFile">
				<div className="articleContent">Edit is not supported for this file type</div>
			</div>
		);
	}

	//function togglePreviewPanel(): void {
	//	let show = !Utils.tryGetBool(window, "showPreviewPanel", true);
	//	window["showPreviewPanel"] = show;
	//	$(".preview").toggle(show);
	//}

	function onEditorChange(ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newText: string): void {
		content = newText;
	//	switch (fileDetails?.type) {
	//		case Workspaces.FileType.Markdown: {
	//			$("#previewContainer").text(content);
	//			break;
	//		}
	//	}
	}

}

