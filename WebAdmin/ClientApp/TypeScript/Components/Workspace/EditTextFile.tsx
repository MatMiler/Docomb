import { CommandBar, Dialog, DialogFooter, DialogType, ICommandBarItemProps, Spinner, SpinnerSize, TextField } from "@fluentui/react";
import React, { FC, ReactElement } from "react";
import { useHistory } from "react-router-dom";
import { useBoolean, IUseBooleanCallbacks } from '@fluentui/react-hooks';
import { Utils } from "../../Data/Utils";
import { Workspaces } from "../../Data/Workspaces";
import { LayoutUtils } from "../../LayoutUtils";
import PageBreadcrumbs from "./PageBreadcrumbs";
import $ from 'jquery';


const EditTextFile: FC<{}> = (): ReactElement => {
	const history = useHistory();
	function navigate(url: string) { history.push(url); }

	const [waitingIsVisible, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting }] = useBoolean(false);

	EditTextFileController.prepData(navigate, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting });

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
		</>
	);
};

export default EditTextFile;


module EditTextFileController {

	export let pageInfo: Workspaces.WorkspacePageInfo = null;
	export let fileDetails: Workspaces.FileDetails = null;
	export let navigateCallback: (url: string) => void = null;
	let content: string = null;

	let waitingDialogCallbacks: IUseBooleanCallbacks = null;

	export function prepData(navigate: (url: string) => void, waitingDialog: IUseBooleanCallbacks): void {
		let newPageInfo: Workspaces.WorkspacePageInfo = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo);
		pageInfo = newPageInfo;
		fileDetails = pageInfo?.details;
		content = fileDetails?.contentText;

		EditTextFileController.navigateCallback = navigate;
		waitingDialogCallbacks = waitingDialog;
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

	function save(): void {
		waitingDialogCallbacks.setTrue();
		let c = Utils.parseString($("#editorInput").val(), content);
		$.ajax(
			{
				url: "api/content/saveTextFile",
				type: "POST",
				data: { url: fileDetails?.reactLocalUrl, textContent: c },
				success: onSaveSuccess,
				error: onSaveError
			});
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

