var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { Component, useState } from "react";
import { useBoolean } from '@fluentui/react-hooks';
import { CommandBar, DetailsList, Dialog, DialogFooter, DialogType, FontIcon, mergeStyles, PrimaryButton, ScrollablePane, Spinner, SpinnerSize, Stack, Sticky, Selection, TextField, DefaultButton, Dropdown } from "@fluentui/react";
import SettingsBreadcrumbs from "./SettingsBreadcrumbs";
import { Users } from "../../Data/Users";
import { Utils } from "../../Data/Utils";
import { Layout } from "../Layout";
import $ from 'jquery';
const GlobalUsersUi = () => {
    var _a, _b;
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
    GlobalUsersController.Ui.prepEditor(setDataHash, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting }, { toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert, setTitle: setAlertTitle, setContent: setAlertContent });
    GlobalUsersController.AddUsers.callbacks = { toggle: toggleAdd, setTrue: showAdd, setFalse: hideAdd };
    GlobalUsersController.ChangeAccess.callbacks = { toggle: toggleChangeAccess, setTrue: showChangeAccess, setFalse: hideChangeAccess };
    GlobalUsersController.Delete.callbacks = { toggle: toggleDelete, setTrue: showDelete, setFalse: hideDelete };
    return (React.createElement(Layout, { mainNavType: "settings" },
        React.createElement("div", { className: "pageGrid" },
            React.createElement("div", { className: "pageTitle" },
                React.createElement(SettingsBreadcrumbs, { path: [{ name: "Global users", url: "/globalUsers" }] })),
            GlobalUsersController.Ui.getToolbar(),
            React.createElement("div", { className: "pageContent" }, GlobalUsersController.Ui.getContentPanel())),
        React.createElement(Dialog, { hidden: !waitingIsVisible, dialogContentProps: { type: DialogType.normal, title: null, showCloseButton: false }, modalProps: { isBlocking: true } },
            React.createElement(DialogFooter, null,
                React.createElement(Spinner, { label: "Please wait...", labelPosition: "right", size: SpinnerSize.large }))),
        React.createElement(Dialog, { hidden: !alertIsVisible, dialogContentProps: { type: DialogType.largeHeader, title: alertTitle }, modalProps: { isBlocking: false }, onDismiss: hideAlert },
            React.createElement(Stack, { horizontal: true, verticalAlign: "center" },
                React.createElement(FontIcon, { iconName: "Warning", className: mergeStyles({ fontSize: 30, width: 30, height: 36, lineHeight: 36, margin: "0 16px 0 0" }) }),
                React.createElement("div", null, alertContent)),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: hideAlert, text: "OK" }))),
        React.createElement(Dialog, { hidden: !addIsVisible, onDismiss: hideAdd, dialogContentProps: { type: DialogType.largeHeader, title: "Add users" }, modalProps: { isBlocking: false } },
            React.createElement(TextField, { label: "Usernames", id: "usernamesInput", multiline: true, rows: 4, resizable: false, required: true }),
            React.createElement(Dropdown, { label: "Access level", defaultSelectedKey: GlobalUsersController.AddUsers.lastAccessLevel, required: true, onChange: GlobalUsersController.AddUsers.onAccessLevelChange, options: [
                    { key: "None", text: "No access" },
                    { key: "Reader", text: "Reader" },
                    { key: "Editor", text: "Editor" },
                    { key: "Admin", text: "Administrator" }
                ] }),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: GlobalUsersController.AddUsers.finish, text: "Add" }),
                React.createElement(DefaultButton, { onClick: GlobalUsersController.AddUsers.cancel, text: "Cancel" }))),
        React.createElement(Dialog, { hidden: !changeAccessIsVisible, onDismiss: hideChangeAccess, dialogContentProps: { type: DialogType.largeHeader, title: "Change access level" }, modalProps: { isBlocking: false } },
            React.createElement(Dropdown, { label: "Access level", defaultSelectedKey: GlobalUsersController.ChangeAccess.lastAccessLevel, required: true, onChange: GlobalUsersController.ChangeAccess.onAccessLevelChange, options: [
                    { key: "None", text: "No access" },
                    { key: "Reader", text: "Reader" },
                    { key: "Editor", text: "Editor" },
                    { key: "Admin", text: "Administrator" }
                ] }),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: GlobalUsersController.ChangeAccess.finish, text: "Change" }),
                React.createElement(DefaultButton, { onClick: GlobalUsersController.ChangeAccess.cancel, text: "Cancel" }))),
        React.createElement(Dialog, { hidden: !deleteIsVisible, onDismiss: hideDelete, dialogContentProps: {
                type: DialogType.largeHeader,
                title: "Delete user" + ((((_a = GlobalUsersController.Data.selectedUsers) === null || _a === void 0 ? void 0 : _a.length) > 1) ? "s" : ""),
                subText: ((((_b = GlobalUsersController.Data.selectedUsers) === null || _b === void 0 ? void 0 : _b.length) > 1) ? "Delete selected users (" + GlobalUsersController.Data.selectedUsers.length + ")?" : "Delete selected user?")
            }, modalProps: { isBlocking: false } },
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: GlobalUsersController.Delete.finish, text: "Delete" }),
                React.createElement(DefaultButton, { onClick: GlobalUsersController.Delete.cancel, text: "Cancel" })))));
};
const GlobalUsersToolbar = () => {
    const [selectionHash, setSelectionHash] = useState(0);
    GlobalUsersController.Ui.prepToolbar(setSelectionHash);
    return (React.createElement("div", { className: "pageCommands" },
        React.createElement(CommandBar, { items: GlobalUsersController.Ui.getToolbarItems(), farItems: GlobalUsersController.Ui.getToolbarFarItems() })));
};
class GlobalUsers extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        GlobalUsersController.Data.loadData();
    }
    render() {
        return (React.createElement(GlobalUsersUi, null));
    }
}
export default GlobalUsers;
var GlobalUsersController;
(function (GlobalUsersController) {
    let dataStateCallback = null;
    let waitingDialogCallbacks = null;
    let alertDialogCallbacks = null;
    let selectionHashCallback = null;
    GlobalUsersController.isLoaded = false;
    let Ui;
    (function (Ui) {
        function prepEditor(setDataState, waitingDialog, alertDialog) {
            dataStateCallback = setDataState;
            waitingDialogCallbacks = waitingDialog;
            alertDialogCallbacks = alertDialog;
        }
        Ui.prepEditor = prepEditor;
        function prepToolbar(setSelectionHash) {
            selectionHashCallback = setSelectionHash;
        }
        Ui.prepToolbar = prepToolbar;
        function getToolbar() {
            return React.createElement(GlobalUsersToolbar, null);
        }
        Ui.getToolbar = getToolbar;
        function getToolbarItems() {
            var _a;
            let commandBarItems = [];
            commandBarItems.push({ key: "add", text: "Add user", onClick: AddUsers.show, iconProps: { iconName: "Add" } });
            if (Data.hasSelection) {
                commandBarItems.push({ key: "changeAccessLevel", text: "Change access level", onClick: ChangeAccess.show, iconProps: { iconName: "Edit" } });
                commandBarItems.push({ key: "delete", text: "Delete user" + ((((_a = Data.selectedUsers) === null || _a === void 0 ? void 0 : _a.length) > 1) ? "s" : ""), onClick: Delete.show, iconProps: { iconName: "Delete" } });
            }
            return commandBarItems;
        }
        Ui.getToolbarItems = getToolbarItems;
        function getToolbarFarItems() {
            var _a;
            let commandBarItems = [];
            if (Data.hasSelection) {
                commandBarItems.push({ key: "clearSelection", text: "Clear selection (" + ((_a = Data.selectedUsers) === null || _a === void 0 ? void 0 : _a.length) + ")", onClick: Data.clearSelection, iconProps: { iconName: "Cancel" } });
            }
            return commandBarItems;
        }
        Ui.getToolbarFarItems = getToolbarFarItems;
        function getContentPanel() {
            if (!GlobalUsersController.isLoaded)
                return (React.createElement("div", { className: "loadingSpinner" },
                    React.createElement(Spinner, { label: "Loading...", labelPosition: "right", size: SpinnerSize.large })));
            return (React.createElement("div", { className: "usersEditor" },
                React.createElement("div", { className: "list" },
                    React.createElement(ScrollablePane, null,
                        React.createElement(DetailsList, { items: Data.users, columns: [
                                { key: 'username', name: 'Username', fieldName: 'username', minWidth: 100, maxWidth: 400, isResizable: true },
                                { key: 'accessLevel', name: 'Access level', fieldName: 'accessLevelName', minWidth: 100, maxWidth: 200, isResizable: true },
                            ], getKey: (item, index) => item.username, selection: Data.getSelectionManager(), onRenderDetailsHeader: (detailsHeaderProps, defaultRender) => (React.createElement(Sticky, null, defaultRender(detailsHeaderProps))) })))));
        }
        Ui.getContentPanel = getContentPanel;
    })(Ui = GlobalUsersController.Ui || (GlobalUsersController.Ui = {}));
    let Data;
    (function (Data) {
        let userLevels = null;
        Data.users = [];
        function loadData() {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                let response = yield Users.loadGlobalUsers();
                GlobalUsersController.isLoaded = true;
                if (((_a = response === null || response === void 0 ? void 0 : response.actionStatus) === null || _a === void 0 ? void 0 : _a.isOk) != true) {
                    let title = "Can't load users";
                    let desc = response.actionStatus.getDialogMessage();
                    alertDialogCallbacks.setTrue();
                    alertDialogCallbacks.setTitle(title);
                    alertDialogCallbacks.setContent(desc);
                    return;
                }
                userLevels = response === null || response === void 0 ? void 0 : response.data;
                Data.users = Utils.objectToArray(userLevels, (key, value) => new Data.User(key, value)).sort((a, b) => (a.username > b.username) ? 1 : -1);
                dataStateCallback(Utils.hashCode(userLevels));
            });
        }
        Data.loadData = loadData;
        class User {
            constructor(username, accessLevel) {
                this.change = Users.UserChangeCommand.None;
                this.key = this.username = username;
                this.setAccessLevel(accessLevel);
            }
            setAccessLevel(accessLevel) {
                this.accessLevel = accessLevel;
                this.accessLevelName = Users.getUserAccessLevelName(accessLevel);
            }
            toUserChange() {
                return new Users.UserChange(this.username, this.accessLevel, this.change);
            }
        }
        Data.User = User;
        Data.selectionManager = null;
        Data.selectedUsers = null;
        function getSelectionManager() {
            if (Data.selectionManager == null) {
                Data.selectionManager = new Selection({ onSelectionChanged: onSelectionChange });
            }
            return Data.selectionManager;
        }
        Data.getSelectionManager = getSelectionManager;
        Data.hasSelection = false;
        function onSelectionChange() {
            Data.selectedUsers = Data.selectionManager.getSelection();
            Data.hasSelection = Utils.arrayHasValues(Data.selectedUsers);
            selectionHashCallback(Utils.hashCode(Data.selectedUsers));
        }
        Data.onSelectionChange = onSelectionChange;
        function clearSelection() {
            Data.selectionManager.setAllSelected(false);
        }
        Data.clearSelection = clearSelection;
        function commitChanges() {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                let changes = Utils.mapArray(Data.users.filter(x => ((x === null || x === void 0 ? void 0 : x.change) != null) && (x.change != Users.UserChangeCommand.None)), (x) => x.toUserChange());
                waitingDialogCallbacks.setTrue();
                let response = yield Users.changeGlobalUsers(changes);
                waitingDialogCallbacks.setFalse();
                if (((_a = response === null || response === void 0 ? void 0 : response.actionStatus) === null || _a === void 0 ? void 0 : _a.isOk) == true) {
                    userLevels = response === null || response === void 0 ? void 0 : response.data;
                    Data.users = Utils.objectToArray(userLevels, (key, value) => new Data.User(key, value)).sort((a, b) => (a.username > b.username) ? 1 : -1);
                    dataStateCallback(Utils.hashCode(userLevels));
                }
                else {
                    let title = "Can't update users";
                    let desc = response.actionStatus.getDialogMessage();
                    alertDialogCallbacks.setTrue();
                    alertDialogCallbacks.setTitle(title);
                    alertDialogCallbacks.setContent(desc);
                }
            });
        }
        Data.commitChanges = commitChanges;
    })(Data = GlobalUsersController.Data || (GlobalUsersController.Data = {}));
    let AddUsers;
    (function (AddUsers) {
        AddUsers.callbacks = null;
        function show() {
            AddUsers.callbacks.setTrue();
        }
        AddUsers.show = show;
        function finish() {
            return __awaiter(this, void 0, void 0, function* () {
                let usernamesSource = Utils.trimString($("#usernamesInput", "").val());
                let usernames = Utils.mapArray(usernamesSource === null || usernamesSource === void 0 ? void 0 : usernamesSource.split(/[\,\;\r\n \t]/), (x) => x === null || x === void 0 ? void 0 : x.trim(), (x) => (x === null || x === void 0 ? void 0 : x.length) > 0, false);
                AddUsers.callbacks.setFalse();
                if ((usernames == null) || (usernames.length <= 0))
                    return;
                for (let x = 0; x < usernames.length; x++) {
                    let username = usernames[x];
                    let matched = Data.users.filter(x => { var _a; return ((_a = x.username) === null || _a === void 0 ? void 0 : _a.toLowerCase()) == (username === null || username === void 0 ? void 0 : username.toLowerCase()); });
                    if ((matched === null || matched === void 0 ? void 0 : matched.length) > 0) {
                        for (let y = 0; y < matched.length; y++) {
                            matched[y].setAccessLevel(AddUsers.lastAccessLevel);
                            matched[y].change = Users.UserChangeCommand.Update;
                        }
                    }
                    else {
                        let user = new Data.User(username, AddUsers.lastAccessLevel);
                        user.change = Users.UserChangeCommand.Add;
                        Data.users.push(user);
                    }
                }
                Data.users = Data.users.sort((a, b) => (a.username > b.username) ? 1 : -1);
                Data.commitChanges();
            });
        }
        AddUsers.finish = finish;
        AddUsers.lastAccessLevel = Users.UserAccessLevel.Editor;
        function onAccessLevelChange(event, option, index) {
            AddUsers.lastAccessLevel = Utils.parseEnum(option === null || option === void 0 ? void 0 : option.key, Users.UserAccessLevel, null);
        }
        AddUsers.onAccessLevelChange = onAccessLevelChange;
        function cancel() {
            AddUsers.callbacks.setFalse();
        }
        AddUsers.cancel = cancel;
    })(AddUsers = GlobalUsersController.AddUsers || (GlobalUsersController.AddUsers = {}));
    let ChangeAccess;
    (function (ChangeAccess) {
        ChangeAccess.callbacks = null;
        function show() {
            ChangeAccess.lastAccessLevel = getSelectionAccessLevel();
            ChangeAccess.callbacks.setTrue();
        }
        ChangeAccess.show = show;
        function getSelectionAccessLevel() {
            var _a, _b;
            let users = Data.selectedUsers;
            if ((users === null || users === void 0 ? void 0 : users.length) > 0) {
                let level = (_a = users[0]) === null || _a === void 0 ? void 0 : _a.accessLevel;
                for (let x = 1; x < users.length; x++) {
                    if (((_b = users[x]) === null || _b === void 0 ? void 0 : _b.accessLevel) != level)
                        return null;
                }
                return level;
            }
            return null;
        }
        function finish() {
            return __awaiter(this, void 0, void 0, function* () {
                ChangeAccess.callbacks.setFalse();
                let level = ChangeAccess.lastAccessLevel;
                if (level == null)
                    return;
                let users = Data.selectedUsers;
                if ((users === null || users === void 0 ? void 0 : users.length) > 0) {
                    for (let x = 0; x < users.length; x++) {
                        users[x].setAccessLevel(ChangeAccess.lastAccessLevel);
                        users[x].change = Users.UserChangeCommand.Update;
                    }
                }
                Data.commitChanges();
            });
        }
        ChangeAccess.finish = finish;
        ChangeAccess.lastAccessLevel = Users.UserAccessLevel.Editor;
        function onAccessLevelChange(event, option, index) {
            ChangeAccess.lastAccessLevel = Utils.parseEnum(option === null || option === void 0 ? void 0 : option.key, Users.UserAccessLevel, null);
        }
        ChangeAccess.onAccessLevelChange = onAccessLevelChange;
        function cancel() {
            ChangeAccess.callbacks.setFalse();
        }
        ChangeAccess.cancel = cancel;
    })(ChangeAccess = GlobalUsersController.ChangeAccess || (GlobalUsersController.ChangeAccess = {}));
    let Delete;
    (function (Delete) {
        Delete.callbacks = null;
        function show() {
            Delete.callbacks.setTrue();
        }
        Delete.show = show;
        function finish() {
            return __awaiter(this, void 0, void 0, function* () {
                Delete.callbacks.setFalse();
                let users = Data.selectedUsers;
                if ((users === null || users === void 0 ? void 0 : users.length) > 0) {
                    for (let x = 0; x < users.length; x++) {
                        users[x].change = Users.UserChangeCommand.Remove;
                    }
                }
                Data.commitChanges();
            });
        }
        Delete.finish = finish;
        function cancel() {
            Delete.callbacks.setFalse();
        }
        Delete.cancel = cancel;
    })(Delete = GlobalUsersController.Delete || (GlobalUsersController.Delete = {}));
})(GlobalUsersController || (GlobalUsersController = {}));
//# sourceMappingURL=GlobalUsers.js.map