import { CommandBar, Dialog, DialogFooter, DialogType, FontIcon, ICommandBarItemProps, mergeStyles, PrimaryButton, ScrollablePane, Spinner, SpinnerSize, Stack, Sticky, StickyPositionType, TextField } from "@fluentui/react";
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
			//case Workspaces.FileType.Html: { hasPreview = true; break; }
			//case Workspaces.FileType.PlainText: { hasPreview = false; break; }
		}

		if (hasPreview) {
			farItems.push({ key: "togglePreview", text: "Toggle preview", iconOnly: true, ariaLabel: "Toggle preview", iconProps: { iconName: "EntryView" }, onClick: togglePreviewPanel });
		}
		if (fileDetails?.type == Workspaces.FileType.Markdown) {
			farItems.push({ key: "toggleMarkdownHelp", text: "Toggle help", iconOnly: true, ariaLabel: "Toggle help", iconProps: { iconName: "Unknown" }, onClick: toggleHelpPanel });
		}

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

	export function getContentPanel(): JSX.Element {
		let previewStyle: React.CSSProperties = {};
		if (!Utils.tryGetBool(window, "showPreviewPanel", true)) previewStyle.display = "none";

		switch (fileDetails?.type) {
			case Workspaces.FileType.Markdown: {
				return (
					<div className="editTextFile">
						<div className="editor watermarkedPart">
							<div className="watermark"><FontIcon iconName="Edit" /></div>
							<div className="editorInput"><TextField id="editorInput" defaultValue={fileDetails?.contentText} multiline resizable={false} onChange={onEditorChange} /></div>
						</div>
						<div className="preview watermarkedPart" style={previewStyle}>
							<div className="watermark"><FontIcon iconName="EntryView" /></div>
							<div id="previewContainer" className="articleContent"
								dangerouslySetInnerHTML={{ __html: LayoutUtils.fixLocalLinksInHtml(fileDetails.contentHtml, pageInfo?.workspace, pageInfo?.contentItem) }} />
						</div>
						{getMarkdownHelpPanel()}
					</div>
				);
			}
			case Workspaces.FileType.Html: case Workspaces.FileType.PlainText: {
				return (
					<div className="editTextFile">
						<div className="editor watermarkedPart">
							<div className="watermark"><FontIcon iconName="Edit" /></div>
							<div className="editorInput"><TextField id="editorInput" defaultValue={fileDetails?.contentText} multiline resizable={false} onChange={onEditorChange} /></div>
						</div>
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

	function togglePreviewPanel(): void {
		let show = !Utils.tryGetBool(window, "showPreviewPanel", true);
		window["showPreviewPanel"] = show;
		$(".preview").toggle(show);
	}

	function getMarkdownHelpPanel(): JSX.Element {
		let elements: Array<JSX.Element> = [];

		let preStyle: React.CSSProperties = { whiteSpace: "normal" };

		elements.push(<>
			{getHelpHeadingRow("Basic styles")}
			<div className="articleContent">
				<p><code>**Bold**</code> or <code>__Bold__</code> → <strong>Bold</strong></p>
				<p><code>*Italic*</code> or <code>_Italic_</code> → <em>Italic</em></p>
			</div></>);

		elements.push(<>
			{getHelpHeadingRow("Headings")}
			<div className="articleContent">
				<p>
					<code># Heading 1 (page title)</code><br />
					<code>## Heading 2</code><br />
					<code>### Heading 3</code><br />
					etc.
				</p>
				<p>or</p>
				<pre style={preStyle}><code>Heading 1<br />===</code></pre>
				<pre style={preStyle}><code>Heading 2<br />---</code></pre>
			</div></>);

		elements.push(<>
			{getHelpHeadingRow("Paragraphs")}
			<div className="articleContent">
				<p>Add an empty line between texts to start a new paragraph.</p>
				<p>Add two spaces at the end of the line<code>··</code><br /> to start a new line.</p>
				<p>For a horizontal rule write <code>---</code>, <code>***</code>, or <code>___</code>.<br/>
				<small>Be sure to have an empty line above <code>---</code> to avoid rendering the previous line as a heading.</small></p>
			</div></>);

		elements.push(<>
			{getHelpHeadingRow("Lists")}
			<div className="articleContent">
				<p>Start a line with <code>-</code> or <code>*</code> for a bulleted list.</p>
				<p>Start a line with <code>1.</code> or <code>1)</code> for a numbered list.</p>
			</div></>);

		elements.push(<>
			{getHelpHeadingRow("Links & Images")}
			<div className="articleContent">
				<p><code>[Link text](URL)</code><br />
				Example: <code>[Link](http://example.com/)</code> → <a href="http://example.com/" target="_blank">Link</a></p>
				<p><code>![Alt text](Image URL)</code></p>
			</div></>);

		elements.push(<>
			{getHelpHeadingRow("Quotes & Code")}
			<div className="articleContent">
				<p><code>&gt; Quote</code></p>
				<blockquote><p>Quote</p></blockquote>
				<p>For inline <code>code</code>, use single backticks before and after: <code>`code`</code>.</p>
				<pre style={preStyle}>```<br />For a code block use three backticks before and after<br/>```</pre>
			</div></>);


		let panelStyle: React.CSSProperties = {};
		if (!Utils.tryGetBool(window, "showHelpPanel", false)) panelStyle.display = "none";

		for (let x = 0; x < elements.length; x++) {
			let className = "helpSection";
			if (x == 0) className += " first";
			if (x == elements.length - 1) className += " last";
			elements[x] = (<div className={className} key={"HelpSection" + x}>{elements[x]}</div>);
		}

		return (
			<div className="help watermarkedPart" style={panelStyle}>
				<div className="watermark"><FontIcon iconName="Unknown" /></div>
				<div id="helpContainer">
					{elements}
				</div>
			</div>);
	}

	function getHelpHeadingRow(text: string): JSX.Element {
		return <div className="helpHeading">{text}</div>;
	}

	function toggleHelpPanel(): void {
		let show = !Utils.tryGetBool(window, "showHelpPanel", false);
		window["showHelpPanel"] = show;
		$(".help").toggle(show);
	}

	function onEditorChange(ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newText: string): void {
		let prevContent: string = content;
		content = newText;
		switch (fileDetails?.type) {
			case Workspaces.FileType.Markdown: {
				let immediate: boolean = false;
				let eventType = Utils.tryGetString(ev, ["nativeEvent", "inputType"]);
				switch (eventType) {
					case "deleteByCut": case "insertFromPaste": case "insertFromDrop": { immediate = true; break; }
				}
				MarkdownPreview.refresh(content, prevContent, immediate);
				break;
			}
		}
	}

	module MarkdownPreview {

		export function refresh(content: string, prevContent: string, immediate: boolean = false): void {
			if (content == prevContent) return; // No changes
			if (((Date.now() - lastRequest) < requestTimeout) && ((updateTimeoutId > 0) || (isExecuting))) return; // Already queued

			let sinceLast: number = Date.now() - lastUpdate;

			if (immediate == true) {
				if (sinceLast < minUpdateInterval) {
					request();
					lastRequest = Date.now();
					return;
				}
				updateTimeoutId = window.setTimeout(request, minUpdateInterval - sinceLast);
				lastRequest = Date.now();
				return;
			}

			updateTimeoutId = window.setTimeout(request, minUpdateInterval);

			lastRequest = Date.now();
		}

		const minUpdateInterval: number = 1500;
		const requestTimeout: number = 15000;
		let updateTimeoutId: number = null;
		let lastUpdate: number = 0;
		let lastRequest: number = 0;
		let isExecuting: boolean = false;

		async function request(): Promise<void> {
			isExecuting = true;
			try {
				let c = Utils.parseString($("#editorInput").val(), content);
				let response = await Apis.postJsonAsync("api/content/previewMarkdown", { url: fileDetails?.reactLocalUrl, textContent: c });
				let status = new Apis.ActionStatus(Utils.tryGet(response, "actionStatus"));
				if (status?.isOk == true) {
					let html: string = Utils.tryGetString(response, "data");
					html = LayoutUtils.fixLocalLinksInHtml(html, pageInfo?.workspace, pageInfo?.contentItem);
					$("#previewContainer").html(html);
				}
			}
			catch (e) {}
			lastUpdate = Date.now();
			updateTimeoutId = null;
			isExecuting = false;
		}

	}

}

