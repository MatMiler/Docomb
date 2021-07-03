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
import { CommandBar, DetailsList, Dialog, DialogFooter, DialogType, FontIcon, mergeStyles, PrimaryButton, ScrollablePane, Spinner, SpinnerSize, Stack, Sticky, Selection } from "@fluentui/react";
import SettingsBreadcrumbs from "./SettingsBreadcrumbs";
import { Users } from "../../Data/Users";
import { Utils } from "../../Data/Utils";
import { Layout } from "../Layout";
const GlobalUsersUi = () => {
    const [dataHash, setDataHash] = useState(0);
    const [waitingIsVisible, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting }] = useBoolean(false);
    const [alertIsVisible, { toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert }] = useBoolean(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertContent, setAlertContent] = useState("");
    GlobalUsersController.prepEditor(setDataHash, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting }, { toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert, setTitle: setAlertTitle, setContent: setAlertContent });
    return (React.createElement(Layout, { mainNavType: "settings" },
        React.createElement("div", { className: "pageGrid" },
            React.createElement("div", { className: "pageTitle" },
                React.createElement(SettingsBreadcrumbs, { path: [{ name: "Global users", url: "/globalUsers" }] })),
            GlobalUsersController.getToolbar(),
            React.createElement("div", { className: "pageContent" }, GlobalUsersController.getContentPanel())),
        React.createElement(Dialog, { hidden: !waitingIsVisible, dialogContentProps: { type: DialogType.normal, title: null, showCloseButton: false }, modalProps: { isBlocking: true } },
            React.createElement(DialogFooter, null,
                React.createElement(Spinner, { label: "Please wait...", labelPosition: "right", size: SpinnerSize.large }))),
        React.createElement(Dialog, { hidden: !alertIsVisible, dialogContentProps: { type: DialogType.largeHeader, title: alertTitle }, modalProps: { isBlocking: false }, onDismiss: hideAlert },
            React.createElement(Stack, { horizontal: true, verticalAlign: "center" },
                React.createElement(FontIcon, { iconName: "Warning", className: mergeStyles({ fontSize: 30, width: 30, height: 36, lineHeight: 36, margin: "0 16px 0 0" }) }),
                React.createElement("div", null, alertContent)),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: hideAlert, text: "OK" })))));
};
const GlobalUsersToolbar = () => {
    const [selectionHash, setSelectionHash] = useState(0);
    GlobalUsersController.prepToolbar(setSelectionHash);
    return (React.createElement("div", { className: "pageCommands" },
        React.createElement(CommandBar, { items: GlobalUsersController.getToolbarItems(), farItems: GlobalUsersController.getToolbarFarItems() })));
};
class GlobalUsers extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        GlobalUsersController.loadData();
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
    let userLevels = null;
    let users = [];
    function prepEditor(setDataState, waitingDialog, alertDialog) {
        dataStateCallback = setDataState;
        waitingDialogCallbacks = waitingDialog;
        alertDialogCallbacks = alertDialog;
    }
    GlobalUsersController.prepEditor = prepEditor;
    function prepToolbar(setSelectionHash) {
        selectionHashCallback = setSelectionHash;
    }
    GlobalUsersController.prepToolbar = prepToolbar;
    function getToolbar() {
        return React.createElement(GlobalUsersToolbar, null);
    }
    GlobalUsersController.getToolbar = getToolbar;
    function getToolbarItems() {
        let commandBarItems = [];
        commandBarItems.push({ key: "add", text: "Add", disabled: true, iconProps: { iconName: "Add" } });
        if (hasSelection) {
            commandBarItems.push({ key: "changeAccessLevel", text: "Change access level", disabled: true, iconProps: { iconName: "Edit" } });
            commandBarItems.push({ key: "delete", text: "Delete user" + (((selectedUsers === null || selectedUsers === void 0 ? void 0 : selectedUsers.length) > 1) ? "s" : ""), disabled: true, iconProps: { iconName: "Delete" } });
        }
        return commandBarItems;
    }
    GlobalUsersController.getToolbarItems = getToolbarItems;
    function getToolbarFarItems() {
        let commandBarItems = [];
        if (hasSelection) {
            commandBarItems.push({ key: "clearSelection", text: "Clear selection (" + (selectedUsers === null || selectedUsers === void 0 ? void 0 : selectedUsers.length) + ")", onClick: clearSelection, iconProps: { iconName: "Cancel" } });
        }
        return commandBarItems;
    }
    GlobalUsersController.getToolbarFarItems = getToolbarFarItems;
    function getContentPanel() {
        if (!GlobalUsersController.isLoaded)
            return (React.createElement("div", { className: "loadingSpinner" },
                React.createElement(Spinner, { label: "Loading...", labelPosition: "right", size: SpinnerSize.large })));
        return (React.createElement("div", { className: "usersEditor" },
            React.createElement("div", { className: "list" },
                React.createElement(ScrollablePane, null,
                    React.createElement(DetailsList, { items: users, columns: [
                            { key: 'username', name: 'Username', fieldName: 'username', minWidth: 100, maxWidth: 400, isResizable: true },
                            { key: 'accessLevel', name: 'Access level', fieldName: 'accessLevelName', minWidth: 100, maxWidth: 200, isResizable: true },
                        ], getKey: (item, index) => item.username, selection: getSelectionManager(), onRenderDetailsHeader: (detailsHeaderProps, defaultRender) => (React.createElement(Sticky, null, defaultRender(detailsHeaderProps))) })))));
    }
    GlobalUsersController.getContentPanel = getContentPanel;
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
            users = Utils.objectToArray(userLevels, (key, value) => new User(key, value)).sort((a, b) => (a.username > b.username) ? 1 : -1);
            dataStateCallback(Utils.hashCode(userLevels));
        });
    }
    GlobalUsersController.loadData = loadData;
    let UserChange;
    (function (UserChange) {
        UserChange["None"] = "None";
        UserChange["Add"] = "Add";
        UserChange["Update"] = "Update";
        UserChange["Remove"] = "Remove";
    })(UserChange || (UserChange = {}));
    class User {
        constructor(username, accessLevel) {
            this.change = UserChange.None;
            this.key = this.username = username;
            this.accessLevel = accessLevel;
            this.accessLevelName = Users.getUserAccessLevelName(accessLevel);
        }
    }
    let selectionManager = null;
    let selectedUsers = null;
    function getSelectionManager() {
        if (selectionManager == null) {
            selectionManager = new Selection({ onSelectionChanged: onSelectionChange });
        }
        return selectionManager;
    }
    let hasSelection = false;
    function onSelectionChange() {
        selectedUsers = selectionManager.getSelection();
        hasSelection = Utils.arrayHasValues(selectedUsers);
        selectionHashCallback(Utils.hashCode(selectedUsers));
    }
    function clearSelection() {
        selectionManager.setAllSelected(false);
    }
    function commitChanges() {
        return __awaiter(this, void 0, void 0, function* () {
            let changes = users.filter(x => ((x === null || x === void 0 ? void 0 : x.change) != null) && (x.change != UserChange.None));
            console.log(changes);
        });
    }
})(GlobalUsersController || (GlobalUsersController = {}));
//# sourceMappingURL=GlobalUsers.js.map