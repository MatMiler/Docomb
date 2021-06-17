import { CommandBar, ContextualMenuItemType, DefaultButton, Dialog, DialogFooter, DialogType, FontIcon, ICommandBarItemProps, IDialogContentProps, IModalProps, PrimaryButton, TextField } from '@fluentui/react';
import React, { FC, ReactElement } from 'react';
import { useHistory } from "react-router-dom";
import { useBoolean } from '@fluentui/react-hooks';
import { Utils } from '../../Data/Utils';
import { Workspaces } from '../../Data/Workspaces';
import { LayoutUtils } from '../../LayoutUtils';
import PageBreadcrumbs from './PageBreadcrumbs';
import $ from 'jquery';
import { EventBus } from '../../EventBus';


const ContentDirectory: FC<{}> = (): ReactElement => {
	const history = useHistory();
	function navigate(url: string) { history.push(url); }

	const [showRenameDialog, { toggle: toggleRenameDialog }] = useBoolean(false);
	const [showMoveDialog, { toggle: toggleMoveDialog }] = useBoolean(false);

	ContentDirectoryController.prepData(navigate, toggleRenameDialog, toggleMoveDialog);

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
			<Dialog
				hidden={!showRenameDialog}
				onDismiss={toggleRenameDialog}
				dialogContentProps={renameDialogContent}
				modalProps={renameDialogModal}
			>
				<TextField label="New folder name" id="renameInput" defaultValue={ContentDirectoryController?.pageInfo?.contentItem?.name} />
				<DialogFooter>
					<PrimaryButton onClick={ContentDirectoryController.Rename.finish} text="Rename" />
					<DefaultButton onClick={ContentDirectoryController.Rename.cancel} text="Cancel" />
				</DialogFooter>
			</Dialog>
		</>
	);
};

export default ContentDirectory;






module ContentDirectoryController {
	export let pageInfo: Workspaces.WorkspacePageInfo = null;
	export let isRoot = false;
	let navigateCallback: (url: string) => void = null;
	let toggleRenameDialogCallback: () => void = null;
	let toggleMoveDialogCallback: () => void = null;



	export function prepData(navigate: (
		url: string) => void,
		toggleRenameDialog: () => void,
		toggleMoveDialog: () => void): void {
		let newPageInfo: Workspaces.WorkspacePageInfo = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo);
		pageInfo = newPageInfo;
		navigateCallback = navigate;
		toggleRenameDialogCallback = toggleRenameDialog;
		toggleMoveDialogCallback = toggleMoveDialog;

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
			commandBarItems.push({ key: "move", text: "Move", disabled: true, iconProps: { iconName: "MoveToFolder" } });
			commandBarItems.push({ key: "delete", text: "Delete", disabled: true, iconProps: { iconName: "Delete" } });
		}

		return (<div className="pageCommands"><CommandBar items={commandBarItems} /></div>);

	}





	export module Rename {
		export function show(): void {
			toggleRenameDialogCallback();
		}

		export async function finish(): Promise<void> {
			let fileName: string = Utils.trimString($("#renameInput", "").val());
			toggleRenameDialogCallback();
			let response: Workspaces.RenameResponse = await Workspaces.renameDirectory(pageInfo?.contentItem?.reactLocalUrl, fileName);
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


