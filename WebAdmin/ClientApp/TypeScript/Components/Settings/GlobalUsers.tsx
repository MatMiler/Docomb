import React, { Component, FC, ReactElement, useState } from "react";
import { useBoolean, IUseBooleanCallbacks } from '@fluentui/react-hooks';
import { CommandBar, DetailsList, Dialog, DialogFooter, DialogType, FontIcon, ICommandBarItemProps, IDetailsHeaderProps, IRenderFunction, mergeStyles, PrimaryButton, ScrollablePane, Spinner, SpinnerSize, Stack, Sticky, Selection, ISelection } from "@fluentui/react";
import SettingsBreadcrumbs from "./SettingsBreadcrumbs";
import { Users } from "../../Data/Users";
import { Apis } from "../../Data/Apis";
import { Utils } from "../../Data/Utils";
import { Layout } from "../Layout";



const GlobalUsersUi: FC<{}> = (): ReactElement => {
	const [dataHash, setDataHash] = useState(0);
	const [waitingIsVisible, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting }] = useBoolean(false);
	const [alertIsVisible, { toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert }] = useBoolean(false);
	const [alertTitle, setAlertTitle] = useState("");
	const [alertContent, setAlertContent] = useState("");

	GlobalUsersController.prepEditor(
		setDataHash,
		{ toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting },
		{ toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert, setTitle: setAlertTitle, setContent: setAlertContent }
	);

	return (
		<Layout mainNavType="settings">
			<div className="pageGrid">
				<div className="pageTitle"><SettingsBreadcrumbs path={[{ name: "Global users", url: "/globalUsers" }]} /></div>
				{GlobalUsersController.getToolbar()}
				<div className="pageContent">
					{GlobalUsersController.getContentPanel()}
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
		</Layout>
	);
};


const GlobalUsersToolbar: FC<{}> = (): ReactElement => {
	const [selectionHash, setSelectionHash] = useState(0);

	GlobalUsersController.prepToolbar(setSelectionHash);

	return (<div className="pageCommands">
		<CommandBar
			items={GlobalUsersController.getToolbarItems()}
			farItems={GlobalUsersController.getToolbarFarItems()}
		/>
	</div>);
};


class GlobalUsers extends Component<void, void> {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		GlobalUsersController.loadData();
	}

	render() {
		return (<GlobalUsersUi />);
	}

}

export default GlobalUsers;


module GlobalUsersController {

	export interface IAlertDialogOptions extends IUseBooleanCallbacks {
		setTitle: React.Dispatch<React.SetStateAction<string>>,
		setContent: React.Dispatch<React.SetStateAction<string>>
	}

	let dataStateCallback: React.Dispatch<React.SetStateAction<number>> = null;
	let waitingDialogCallbacks: IUseBooleanCallbacks = null;
	let alertDialogCallbacks: IAlertDialogOptions = null;
	let selectionHashCallback: React.Dispatch<React.SetStateAction<number>> = null;

	export let isLoaded: boolean = false;

	let userLevels: Users.UserLevels = null;
	let users: User[] = [];


	export function prepEditor(
		setDataState: React.Dispatch<React.SetStateAction<number>>,
		waitingDialog: IUseBooleanCallbacks,
		alertDialog: IAlertDialogOptions
	): void {
		dataStateCallback = setDataState;
		waitingDialogCallbacks = waitingDialog;
		alertDialogCallbacks = alertDialog;
	}

	export function prepToolbar(setSelectionHash): void {
		selectionHashCallback = setSelectionHash;
	}


	export function getToolbar(): JSX.Element {
		return <GlobalUsersToolbar />;
	}

	export function getToolbarItems(): ICommandBarItemProps[] {
		let commandBarItems: ICommandBarItemProps[] = [];
		commandBarItems.push({ key: "add", text: "Add", disabled: true, iconProps: { iconName: "Add" } });

		if (hasSelection) {
			commandBarItems.push({ key: "changeAccessLevel", text: "Change access level", disabled: true, iconProps: { iconName: "Edit" } });
			commandBarItems.push({ key: "delete", text: "Delete user" + ((selectedUsers?.length > 1) ? "s" : ""), disabled: true, iconProps: { iconName: "Delete" } });
		}

		return commandBarItems;
	}

	export function getToolbarFarItems(): ICommandBarItemProps[] {
		let commandBarItems: ICommandBarItemProps[] = [];

		if (hasSelection) {
			commandBarItems.push({ key: "clearSelection", text: "Clear selection (" + selectedUsers?.length + ")", onClick: clearSelection, iconProps: { iconName: "Cancel" } });
		}

		return commandBarItems;
	}

	export function getContentPanel(): JSX.Element {
		if (!isLoaded)
			return (<div className="loadingSpinner"><Spinner label="Loading..." labelPosition="right" size={SpinnerSize.large} /></div>);

		return (
			<div className="usersEditor">
				<div className="list">
					<ScrollablePane>
						<DetailsList
							items={users}
							columns={[
								{ key: 'username', name: 'Username', fieldName: 'username', minWidth: 100, maxWidth: 400, isResizable: true },
								{ key: 'accessLevel', name: 'Access level', fieldName: 'accessLevelName', minWidth: 100, maxWidth: 200, isResizable: true },
							]}
							getKey={(item, index) => item.username}
							selection={getSelectionManager()}
							onRenderDetailsHeader={
								(detailsHeaderProps: IDetailsHeaderProps, defaultRender: IRenderFunction<IDetailsHeaderProps>) => (
									<Sticky>
										{defaultRender(detailsHeaderProps)}
									</Sticky>
								)}
							/>
					</ScrollablePane>
				</div>
			</div>
			);
	}


	export async function loadData(): Promise<void> {
		let response: Apis.DataWithStatus<Users.UserLevels> = await Users.loadGlobalUsers();
		isLoaded = true;
		if (response?.actionStatus?.isOk != true) {
			let title = "Can't load users";
			let desc = response.actionStatus.getDialogMessage();
			alertDialogCallbacks.setTrue();
			alertDialogCallbacks.setTitle(title);
			alertDialogCallbacks.setContent(desc);
			return;
		}

		userLevels = response?.data;
		users = Utils.objectToArray(userLevels, (key: string, value: Users.UserAccessLevel) => new User(key, value)).sort((a, b) => (a.username > b.username) ? 1 : -1);
		dataStateCallback(Utils.hashCode(userLevels));
	}

	enum UserChange {
		None = "None",
		Add = "Add",
		Update = "Update",
		Remove = "Remove"
	}

	class User {
		public key: string;
		public username: string;
		public accessLevel: Users.UserAccessLevel;
		public accessLevelName: string;
		public change: UserChange = UserChange.None;

		public constructor(username: string, accessLevel: Users.UserAccessLevel) {
			this.key = this.username = username;
			this.accessLevel = accessLevel;
			this.accessLevelName = Users.getUserAccessLevelName(accessLevel);
		}
	}


	let selectionManager: ISelection<User> = null;
	let selectedUsers: User[] = null;

	function getSelectionManager(): ISelection<User> {
		if (selectionManager == null) {
			selectionManager = new Selection({ onSelectionChanged: onSelectionChange });
		}
		return selectionManager;
	}

	let hasSelection: boolean = false;
	function onSelectionChange(): void {
		selectedUsers = selectionManager.getSelection();
		hasSelection = Utils.arrayHasValues(selectedUsers);
		selectionHashCallback(Utils.hashCode(selectedUsers));
	}

	function clearSelection(): void {
		selectionManager.setAllSelected(false);
	}



	async function commitChanges(): Promise<void> {

		let changes = users.filter(x => (x?.change != null) && (x.change != UserChange.None));


		console.log(changes);
	}

}


