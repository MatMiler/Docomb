var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CommandBar, Dialog, DialogFooter, DialogType, mergeStyles, PrimaryButton, Spinner, SpinnerSize, Stack } from "@fluentui/react";
import React, { useState } from "react";
import { useBoolean } from '@fluentui/react-hooks';
import { Workspaces } from "../../Data/Workspaces";
import { LayoutUtils } from "../../LayoutUtils";
import OptionsBreadcrumbs from "./OptionsBreadcrumbs";
import { GitGraphIcon, WarningIcon } from '@fluentui/react-icons-mdl2';
const GitManager = () => {
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
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "pageGrid" },
            React.createElement("div", { className: "pageTitle" },
                React.createElement(OptionsBreadcrumbs, { path: [{ name: "Git repository", url: "?options=git" }] })),
            GitController.getToolbar(),
            React.createElement("div", { className: "pageContent" },
                React.createElement("div", { className: "emptyPage" },
                    React.createElement("div", { className: "watermark" },
                        React.createElement(GitGraphIcon, null))))),
        React.createElement(Dialog, { hidden: !waitingIsVisible, dialogContentProps: { type: DialogType.normal, title: null, showCloseButton: false }, modalProps: { isBlocking: true } },
            React.createElement(DialogFooter, null,
                React.createElement(Spinner, { label: "Please wait...", labelPosition: "right", size: SpinnerSize.large }))),
        React.createElement(Dialog, { hidden: !alertIsVisible, dialogContentProps: { type: DialogType.largeHeader, title: alertTitle }, modalProps: { isBlocking: false }, onDismiss: hideAlert },
            React.createElement(Stack, { horizontal: true, verticalAlign: "center" },
                React.createElement(WarningIcon, { className: mergeStyles({ fontSize: 30, width: 30, height: 36, lineHeight: 36, margin: "0 16px 0 0" }) }),
                React.createElement("div", null, alertContent)),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: hideAlert, text: "OK" })))));
};
export default GitManager;
var GitController;
(function (GitController) {
    GitController.showWaitingDialog = null;
    GitController.hideWaitingDialog = null;
    GitController.showAlertDialog = null;
    GitController.setAlertTitle = null;
    GitController.setAlertContent = null;
    function prepData() {
    }
    GitController.prepData = prepData;
    function getToolbar() {
        let commandBarItems = [];
        let farItems = [];
        let hasPreview = false;
        commandBarItems.push({ key: "sync", text: "Synchronize", title: "Pull remote changes, then push local changes", onClick: sync, iconProps: { iconName: "Sync" } });
        return (React.createElement("div", { className: "pageCommands" },
            React.createElement(CommandBar, { items: commandBarItems, farItems: farItems })));
    }
    GitController.getToolbar = getToolbar;
    function sync() { syncAsync(); }
    function syncAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            GitController.showWaitingDialog();
            let workspace = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspaceData);
            let status = yield Workspaces.gitSync(workspace === null || workspace === void 0 ? void 0 : workspace.reactLocalUrl);
            GitController.hideWaitingDialog();
            if ((status === null || status === void 0 ? void 0 : status.isOk) != true) {
                let title = "Can't sync with Git repository";
                let desc = status.getDialogMessage();
                GitController.showAlertDialog();
                GitController.setAlertTitle(title);
                GitController.setAlertContent(desc);
            }
        });
    }
})(GitController || (GitController = {}));
//# sourceMappingURL=GitManager.js.map