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
import OptionsBreadcrumbs from "./OptionsBreadcrumbs";


const GitManager: FC<{}> = (): ReactElement => {

	// Waiting dialog
	const [waitingIsVisible, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting }] = useBoolean(false);
	GitController.showWaitingDialog = showWaiting;
	GitController.hideWaitingDialog = hideWaiting;

	// Alert dialog
	const [alertIsVisible, { toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert }] = useBoolean(false);
	const [alertTitle, setAlertTitle] = useState("");
	const [alertContent, setAlertContent] = useState("");
	GitController.showAlertDialog = showAlert;
	GitController.setAlertTitle = setAlertTitle;
	GitController.setAlertContent = setAlertContent;

	return (
		<>
			<div className="pageGrid">
				<div className="pageTitle"><OptionsBreadcrumbs path={[{ name: "Git repository", url: "?options=git" }]} /></div>
				{GitController.getToolbar()}
				<div className="pageContent">
					<div className="emptyPage">
						<div className="watermark"><FontIcon iconName={"GitGraph"} /></div>
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
					<FontIcon iconName="Warning" className={mergeStyles({ fontSize: 30, width: 30, height: 36, lineHeight: 36, margin: "0 16px 0 0" })} />
					<div>{alertContent}</div>
				</Stack>
				<DialogFooter><PrimaryButton onClick={hideAlert} text="OK" /></DialogFooter>
			</Dialog>

		</>
	);
};

export default GitManager;


module GitController {

	export let showWaitingDialog: () => void = null;
	export let hideWaitingDialog: () => void = null;

	export let showAlertDialog: () => void = null;
	export let setAlertTitle: React.Dispatch<React.SetStateAction<string>> = null;
	export let setAlertContent: React.Dispatch<React.SetStateAction<string>> = null;

	export function prepData(
	): void {
	}


	export function getToolbar(): JSX.Element {
		let commandBarItems: ICommandBarItemProps[] = [];
		let farItems: ICommandBarItemProps[] = [];
		let hasPreview = false;


		commandBarItems.push({ key: "sync", text: "Synchronize", title: "Pull remote changes, then push local changes", onClick: sync, iconProps: { iconName: "Sync" } });

		return (<div className="pageCommands"><CommandBar items={commandBarItems} farItems={farItems} /></div>);
	}


	function sync(): void { syncAsync(); }
	async function syncAsync(): Promise<void> {
		showWaitingDialog();
		let workspace: Workspaces.Workspace = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspaceData);
		let status: Apis.ActionStatus = await Workspaces.gitSync(workspace?.reactLocalUrl);
		hideWaitingDialog();
		if (status?.isOk != true) {
			let title = "Can't sync with Git repository";
			let desc = status.getDialogMessage();
			showAlertDialog();
			setAlertTitle(title);
			setAlertContent(desc);
		}
	}


}

