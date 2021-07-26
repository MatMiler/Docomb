import React, { Component, FC, ReactElement, useState } from "react";
import { useBoolean, IUseBooleanCallbacks } from '@fluentui/react-hooks';
import { CommandBar, DetailsList, Dialog, DialogFooter, DialogType, FontIcon, ICommandBarItemProps, IDetailsHeaderProps, IRenderFunction, mergeStyles, PrimaryButton, ScrollablePane, Spinner, SpinnerSize, Stack, Sticky, Selection, ISelection, TextField, DefaultButton, ChoiceGroup, Dropdown, IDropdownOption } from "@fluentui/react";
import SettingsBreadcrumbs from "./SettingsBreadcrumbs";
import { Users } from "../../Data/Users";
import { Apis } from "../../Data/Apis";
import { Utils } from "../../Data/Utils";
import { Layout } from "../Layout";
import $ from 'jquery';



const GlobalUsersUi: FC<{}> = (): ReactElement => {
	const [dataHash, setDataHash] = useState(0);
	const [waitingIsVisible, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting }] = useBoolean(false);
	const [alertIsVisible, { toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert }] = useBoolean(false);
	const [alertTitle, setAlertTitle] = useState("");
	const [alertContent, setAlertContent] = useState("");

	// Add users directory
	const [addIsVisible, { toggle: toggleAdd, setTrue: showAdd, setFalse: hideAdd }] = useBoolean(false);

	// Change access level
	const [changeAccessIsVisible, { toggle: toggleChangeAccess, setTrue: showChangeAccess, setFalse: hideChangeAccess }] = useBoolean(false);

	// Delete users
	const [deleteIsVisible, { toggle: toggleDelete, setTrue: showDelete, setFalse: hideDelete }] = useBoolean(false);

	GlobalUsersController.Ui.prepEditor(
		setDataHash,
		{ toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting },
		{ toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert, setTitle: setAlertTitle, setContent: setAlertContent }
	);
	GlobalUsersController.AddUsers.callbacks = { toggle: toggleAdd, setTrue: showAdd, setFalse: hideAdd };
	GlobalUsersController.ChangeAccess.callbacks = { toggle: toggleChangeAccess, setTrue: showChangeAccess, setFalse: hideChangeAccess };
	GlobalUsersController.Delete.callbacks = { toggle: toggleDelete, setTrue: showDelete, setFalse: hideDelete };

	return (
		<Layout mainNavType="settings">
			<div className="pageGrid">
				<div className="pageTitle"><SettingsBreadcrumbs path={[{ name: "Global users", url: "/globalUsers" }]} /></div>
				{GlobalUsersController.Ui.getToolbar()}
				<div className="pageContent">
					{GlobalUsersController.Ui.getContentPanel()}
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



			{/* Add users dialog */}
			<Dialog
				hidden={!addIsVisible}
				onDismiss={hideAdd}
				dialogContentProps={{ type: DialogType.largeHeader, title: "Add users" }}
				modalProps={{ isBlocking: false }}
			>
				<TextField label="Usernames" id="usernamesInput" multiline rows={4} resizable={false} required={true} />
				<Dropdown
					label="Access level"
					defaultSelectedKey={GlobalUsersController.AddUsers.lastAccessLevel} required={true} onChange={GlobalUsersController.AddUsers.onAccessLevelChange}
					options={[
						{ key: "None", text: "No access" },
						{ key: "Reader", text: "Reader" },
						{ key: "Editor", text: "Editor" },
						{ key: "Admin", text: "Administrator" }
					]}
				/>
				<DialogFooter>
					<PrimaryButton onClick={GlobalUsersController.AddUsers.finish} text="Add" />
					<DefaultButton onClick={GlobalUsersController.AddUsers.cancel} text="Cancel" />
				</DialogFooter>
			</Dialog>


			{/* Change access dialog */}
			<Dialog
				hidden={!changeAccessIsVisible}
				onDismiss={hideChangeAccess}
				dialogContentProps={{ type: DialogType.largeHeader, title: "Change access level" }}
				modalProps={{ isBlocking: false }}
			>
				<Dropdown
					label="Access level"
					defaultSelectedKey={GlobalUsersController.ChangeAccess.lastAccessLevel} required={true} onChange={GlobalUsersController.ChangeAccess.onAccessLevelChange}
					options={[
						{ key: "None", text: "No access" },
						{ key: "Reader", text: "Reader" },
						{ key: "Editor", text: "Editor" },
						{ key: "Admin", text: "Administrator" }
					]}
				/>
				<DialogFooter>
					<PrimaryButton onClick={GlobalUsersController.ChangeAccess.finish} text="Change" />
					<DefaultButton onClick={GlobalUsersController.ChangeAccess.cancel} text="Cancel" />
				</DialogFooter>
			</Dialog>

			{/* Delete users */}
			<Dialog
				hidden={!deleteIsVisible}
				onDismiss={hideDelete}
				dialogContentProps={{
					type: DialogType.largeHeader,
					title: "Delete user" + ((GlobalUsersController.Data.selectedUsers?.length > 1) ? "s" : ""),
					subText: ((GlobalUsersController.Data.selectedUsers?.length > 1) ? "Delete selected users (" + GlobalUsersController.Data.selectedUsers.length + ")?" : "Delete selected user?")
				}}
				modalProps={{ isBlocking: false }}
			>
				<DialogFooter>
					<PrimaryButton onClick={GlobalUsersController.Delete.finish} text="Delete" />
					<DefaultButton onClick={GlobalUsersController.Delete.cancel} text="Cancel" />
				</DialogFooter>
			</Dialog>

		</Layout>
	);
};


const GlobalUsersToolbar: FC<{}> = (): ReactElement => {
	const [selectionHash, setSelectionHash] = useState(0);

	GlobalUsersController.Ui.prepToolbar(setSelectionHash);

	return (<div className="pageCommands">
		<CommandBar
			items={GlobalUsersController.Ui.getToolbarItems()}
			farItems={GlobalUsersController.Ui.getToolbarFarItems()}
		/>
	</div>);
};


class GlobalUsers extends Component<void, void> {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		GlobalUsersController.Data.loadData();
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

	export module Ui {

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
			commandBarItems.push({ key: "add", text: "Add user", onClick: AddUsers.show, iconProps: { iconName: "Add" } });

			if (Data.hasSelection) {
				commandBarItems.push({ key: "changeAccessLevel", text: "Change access level", onClick: ChangeAccess.show, iconProps: { iconName: "Edit" } });
				commandBarItems.push({ key: "delete", text: "Delete user" + ((Data.selectedUsers?.length > 1) ? "s" : ""), onClick: Delete.show, iconProps: { iconName: "Delete" } });
			}

			return commandBarItems;
		}

		export function getToolbarFarItems(): ICommandBarItemProps[] {
			let commandBarItems: ICommandBarItemProps[] = [];

			if (Data.hasSelection) {
				commandBarItems.push({ key: "clearSelection", text: "Clear selection (" + Data.selectedUsers?.length + ")", onClick: Data.clearSelection, iconProps: { iconName: "Cancel" } });
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
								items={Data.users}
								columns={[
									{ key: 'username', name: 'Username', fieldName: 'username', minWidth: 100, maxWidth: 400, isResizable: true },
									{ key: 'accessLevel', name: 'Access level', fieldName: 'accessLevelName', minWidth: 100, maxWidth: 200, isResizable: true },
								]}
								getKey={(item, index) => item.username}
								selection={Data.getSelectionManager()}
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



	}




	export module Data {
		let userLevels: Users.UserLevels = null;
		export let users: Data.User[] = [];

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
			users = Utils.objectToArray(userLevels, (key: string, value: Users.UserAccessLevel) => new Data.User(key, value)).sort((a, b) => (a.username > b.username) ? 1 : -1);
			dataStateCallback(Utils.hashCode(userLevels));
		}

		export class User {
			public key: string;
			public username: string;
			public accessLevel: Users.UserAccessLevel;
			public accessLevelName: string;
			public change: Users.UserChangeCommand = Users.UserChangeCommand.None;

			public constructor(username: string, accessLevel: Users.UserAccessLevel) {
				this.key = this.username = username;
				this.setAccessLevel(accessLevel);
			}

			public setAccessLevel(accessLevel: Users.UserAccessLevel): void {
				this.accessLevel = accessLevel;
				this.accessLevelName = Users.getUserAccessLevelName(accessLevel);
			}

			public toUserChange(): Users.UserChange {
				return new Users.UserChange(this.username, this.accessLevel, this.change);
			}
		}

		export let selectionManager: ISelection<User> = null;
		export let selectedUsers: User[] = null;

		export function getSelectionManager(): ISelection<User> {
			if (selectionManager == null) {
				selectionManager = new Selection({ onSelectionChanged: onSelectionChange });
			}
			return selectionManager;
		}

		export let hasSelection: boolean = false;
		export function onSelectionChange(): void {
			selectedUsers = selectionManager.getSelection();
			hasSelection = Utils.arrayHasValues(selectedUsers);
			selectionHashCallback(Utils.hashCode(selectedUsers));
		}

		export function clearSelection(): void {
			selectionManager.setAllSelected(false);
		}

		export async function commitChanges(): Promise<void> {
			let changes: Users.UserChange[] = Utils.mapArray(users.filter(x => (x?.change != null) && (x.change != Users.UserChangeCommand.None)), (x: User) => x.toUserChange());

			waitingDialogCallbacks.setTrue();
			let response = await Users.changeGlobalUsers(changes);
			waitingDialogCallbacks.setFalse();
			if (response?.actionStatus?.isOk == true) {
				userLevels = response?.data;
				users = Utils.objectToArray(userLevels, (key: string, value: Users.UserAccessLevel) => new Data.User(key, value)).sort((a, b) => (a.username > b.username) ? 1 : -1);
				dataStateCallback(Utils.hashCode(userLevels));
			} else {
				let title = "Can't update users";
				let desc = response.actionStatus.getDialogMessage();
				alertDialogCallbacks.setTrue();
				alertDialogCallbacks.setTitle(title);
				alertDialogCallbacks.setContent(desc);
			}
		}

	}




	export module AddUsers {
		export let callbacks: IUseBooleanCallbacks = null;

		export function show(): void {
			callbacks.setTrue();
		}

		export async function finish(): Promise<void> {
			let usernamesSource: string = Utils.trimString($("#usernamesInput", "").val());
			let usernames: string[] = Utils.mapArray(usernamesSource?.split(/[\,\;\r\n \t]/), (x: string) => x?.trim(), (x: string) => x?.length > 0, false);
			callbacks.setFalse();
			if ((usernames == null) || (usernames.length <= 0)) return;

			for (let x = 0; x < usernames.length; x++) {
				let username: string = usernames[x];
				let matched = Data.users.filter(x => x.username?.toLowerCase() == username?.toLowerCase());
				if (matched?.length > 0) {
					for (let y = 0; y < matched.length; y++) {
						matched[y].setAccessLevel(lastAccessLevel);
						matched[y].change = Users.UserChangeCommand.Update;
					}
				} else {
					let user = new Data.User(username, lastAccessLevel);
					user.change = Users.UserChangeCommand.Add;
					Data.users.push(user);
				}
			}
			Data.users = Data.users.sort((a, b) => (a.username > b.username) ? 1 : -1);

			Data.commitChanges();
		}

		export let lastAccessLevel: Users.UserAccessLevel = Users.UserAccessLevel.Editor;
		export function onAccessLevelChange(event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number): void {
			lastAccessLevel = Utils.parseEnum(option?.key, Users.UserAccessLevel, null);
		}

		export function cancel(): void {
			callbacks.setFalse();
		}
	}




	export module ChangeAccess {
		export let callbacks: IUseBooleanCallbacks = null;

		export function show(): void {
			lastAccessLevel = getSelectionAccessLevel();
			callbacks.setTrue();
		}

		function getSelectionAccessLevel(): Users.UserAccessLevel {
			let users: Data.User[] = Data.selectedUsers;
			if (users?.length > 0) {
				let level: Users.UserAccessLevel = users[0]?.accessLevel;
				for (let x = 1; x < users.length; x++) {
					if (users[x]?.accessLevel != level) return null;
				}
				return level;
			}

			return null;
		}

		export async function finish(): Promise<void> {
			callbacks.setFalse();
			let level: Users.UserAccessLevel = lastAccessLevel;
			if (level == null) return;
			let users: Data.User[] = Data.selectedUsers;
			if (users?.length > 0) {
				for (let x = 0; x < users.length; x++) {
					users[x].setAccessLevel(lastAccessLevel);
					users[x].change = Users.UserChangeCommand.Update;
				}
			}
			Data.commitChanges();
		}

		export let lastAccessLevel: Users.UserAccessLevel = Users.UserAccessLevel.Editor;
		export function onAccessLevelChange(event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number): void {
			lastAccessLevel = Utils.parseEnum(option?.key, Users.UserAccessLevel, null);
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
			callbacks.setFalse();
			let users: Data.User[] = Data.selectedUsers;
			if (users?.length > 0) {
				for (let x = 0; x < users.length; x++) {
					users[x].change = Users.UserChangeCommand.Remove;
				}
			}
			Data.commitChanges();
		}

		export function cancel(): void {
			callbacks.setFalse();
		}
	}
}


