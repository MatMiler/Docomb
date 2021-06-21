var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CommandBar, ContextualMenuItemType, DefaultButton, Dialog, DialogFooter, DialogType, Dropdown, FontIcon, mergeStyles, PrimaryButton, Spinner, SpinnerSize, Stack, TextField } from '@fluentui/react';
import React, { useState } from 'react';
import { useHistory } from "react-router-dom";
import { useBoolean } from '@fluentui/react-hooks';
import { Utils } from '../../Data/Utils';
import { Workspaces } from '../../Data/Workspaces';
import { LayoutUtils } from '../../LayoutUtils';
import PageBreadcrumbs from './PageBreadcrumbs';
import $ from 'jquery';
import { EventBus } from '../../EventBus';
const ContentDirectory = () => {
    var _a, _b;
    const history = useHistory();
    function navigate(url) { history.push(url); }
    //#region Dialog callbacks
    // Waiting dialog
    const [waitingIsVisible, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting }] = useBoolean(false);
    // Alert
    const [alertIsVisible, { toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert }] = useBoolean(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertContent, setAlertContent] = useState("");
    // Rename directory
    const [renameIsVisible, { toggle: toggleRename, setTrue: showRename, setFalse: hideRename }] = useBoolean(false);
    // Move directory
    const [moveIsVisible, { toggle: toggleMove, setTrue: showMove, setFalse: hideMove }] = useBoolean(false);
    const [moveDirectories, setMoveDirectories] = useState([]);
    // Create new file/directory
    const [createIsVisible, { toggle: toggleCreate, setTrue: showCreate, setFalse: hideCreate }] = useBoolean(false);
    const [createLabel, setCreateLabel] = useState("");
    const [createSuffix, setCreateSuffix] = useState("");
    const [createContent, setCreateContent] = useState({});
    // Delete directory
    const [deleteIsVisible, { toggle: toggleDelete, setTrue: showDelete, setFalse: hideDelete }] = useBoolean(false);
    // Upload
    const [uploadOverwriteMixedIsVisible, { toggle: toggleUploadOverwriteMixed, setTrue: showUploadOverwriteMixed, setFalse: hideUploadOverwriteMixed }] = useBoolean(false);
    const [uploadOverwriteIsVisible, { toggle: toggleUploadOverwrite, setTrue: showUploadOverwrite, setFalse: hideUploadOverwrite }] = useBoolean(false);
    //const [uploadHasAnyNewFiles, setUploadHasAnyNewFiles] = useState(true);
    //#endregion
    // Initialize controller & prepare relevant data
    ContentDirectoryController.prepData(navigate, { toggle: toggleWaiting, setTrue: showWaiting, setFalse: hideWaiting }, { toggle: toggleAlert, setTrue: showAlert, setFalse: hideAlert, setTitle: setAlertTitle, setContent: setAlertContent }, { toggle: toggleRename, setTrue: showRename, setFalse: hideRename }, { toggle: toggleMove, setTrue: showMove, setFalse: hideMove, setDirectories: setMoveDirectories }, { toggle: toggleCreate, setTrue: showCreate, setFalse: hideCreate, setLabel: setCreateLabel, setSuffix: setCreateSuffix, setContent: setCreateContent }, { toggle: toggleDelete, setTrue: showDelete, setFalse: hideDelete }, { showOverwriteMixed: showUploadOverwriteMixed, hideOverwriteMixed: hideUploadOverwriteMixed, showOverwrite: showUploadOverwrite, hideOverwrite: hideUploadOverwrite });
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "pageGrid" },
            React.createElement("div", { className: "pageTitle" },
                React.createElement(PageBreadcrumbs, null)),
            ContentDirectoryController.getToolbar(),
            React.createElement("div", { className: "pageContent" },
                React.createElement("div", { className: "emptyPage" },
                    React.createElement("div", { className: "watermark" },
                        React.createElement(FontIcon, { iconName: ContentDirectoryController.isRoot ? "ProjectCollection" : "OpenFolderHorizontal" }))))),
        React.createElement(Dialog, { hidden: !waitingIsVisible, dialogContentProps: { type: DialogType.normal, title: null, showCloseButton: false }, modalProps: { isBlocking: true } },
            React.createElement(DialogFooter, null,
                React.createElement(Spinner, { label: "Please wait...", labelPosition: "right", size: SpinnerSize.large }))),
        React.createElement(Dialog, { hidden: !alertIsVisible, dialogContentProps: { type: DialogType.largeHeader, title: alertTitle }, modalProps: { isBlocking: false }, onDismiss: hideAlert },
            React.createElement(Stack, { horizontal: true, verticalAlign: "center" },
                React.createElement(FontIcon, { iconName: "Warning", className: mergeStyles({ fontSize: 30, width: 30, height: 36, lineHeight: 36, margin: "0 16px 0 0" }) }),
                React.createElement("div", null, alertContent)),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: hideAlert, text: "OK" }))),
        React.createElement(Dialog, { hidden: !renameIsVisible, onDismiss: hideRename, dialogContentProps: { type: DialogType.largeHeader, title: "Rename folder" }, modalProps: { isBlocking: false } },
            React.createElement(TextField, { label: "New folder name", id: "renameInput", defaultValue: (_b = (_a = ContentDirectoryController === null || ContentDirectoryController === void 0 ? void 0 : ContentDirectoryController.pageInfo) === null || _a === void 0 ? void 0 : _a.contentItem) === null || _b === void 0 ? void 0 : _b.name }),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: ContentDirectoryController.Rename.finish, text: "Rename" }),
                React.createElement(DefaultButton, { onClick: ContentDirectoryController.Rename.cancel, text: "Cancel" }))),
        React.createElement(Dialog, { hidden: !moveIsVisible, onDismiss: hideMove, dialogContentProps: { type: DialogType.largeHeader, title: "Move file" }, modalProps: { isBlocking: false } },
            React.createElement(Dropdown, { id: "moveInput", placeholder: "Select a folder", label: "Move to folder", defaultSelectedKey: ContentDirectoryController.pageInfo.contentItem.getParentPath(), options: moveDirectories, onChange: ContentDirectoryController.Move.onSelectionChange }),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: ContentDirectoryController.Move.finish, text: "Move" }),
                React.createElement(DefaultButton, { onClick: ContentDirectoryController.Move.cancel, text: "Cancel" }))),
        React.createElement(Dialog, { hidden: !createIsVisible, onDismiss: hideCreate, dialogContentProps: createContent, modalProps: { isBlocking: false } },
            React.createElement(TextField, { label: createLabel, id: "createInput", defaultValue: "", suffix: createSuffix }),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: ContentDirectoryController.CreateItem.finish, text: "Create" }),
                React.createElement(DefaultButton, { onClick: ContentDirectoryController.CreateItem.cancel, text: "Cancel" }))),
        React.createElement(Dialog, { hidden: !deleteIsVisible, onDismiss: hideDelete, dialogContentProps: { type: DialogType.largeHeader, title: "Delete folder", subText: "Delete this folder?" }, modalProps: { isBlocking: false } },
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: ContentDirectoryController.Delete.finish, text: "Delete" }),
                React.createElement(DefaultButton, { onClick: ContentDirectoryController.Delete.cancel, text: "Cancel" }))),
        React.createElement("input", { id: "uploadFileInput", type: "file", className: "invisibleUploadInput", onChange: ContentDirectoryController.Upload.onUploadSelection, multiple: true }),
        React.createElement(Dialog, { hidden: !uploadOverwriteMixedIsVisible, onDismiss: ContentDirectoryController.Upload.closeAndReset, dialogContentProps: {
                type: DialogType.largeHeader, title: "Files already exist",
                subText: "Would you like to upload all files and overwrite existing, or upload only new files?"
            }, modalProps: { isBlocking: false } },
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: ContentDirectoryController.Upload.uploadAndOverwrite, text: "All" }),
                React.createElement(PrimaryButton, { onClick: ContentDirectoryController.Upload.uploadNewFiles, text: "Only new" }),
                React.createElement(DefaultButton, { onClick: ContentDirectoryController.Upload.closeAndReset, text: "Cancel" }))),
        React.createElement(Dialog, { hidden: !uploadOverwriteIsVisible, onDismiss: ContentDirectoryController.Upload.closeAndReset, dialogContentProps: {
                type: DialogType.largeHeader, title: "Files already exist",
                subText: "Would you like to overwrite existing files?"
            }, modalProps: { isBlocking: false } },
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: ContentDirectoryController.Upload.uploadAndOverwrite, text: "Overwrite" }),
                React.createElement(DefaultButton, { onClick: ContentDirectoryController.Upload.closeAndReset, text: "Cancel" })))));
};
export default ContentDirectory;
var ContentDirectoryController;
(function (ContentDirectoryController) {
    ContentDirectoryController.pageInfo = null;
    ContentDirectoryController.isRoot = false;
    let navigateCallback = null;
    let waitingDialogCallbacks = null;
    let alertDialogCallbacks = null;
    function prepData(navigate, waitingDialog, alertDialog, renameDialog, moveDialog, createDialog, deleteDialog, uploadDialog) {
        let newPageInfo = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo);
        ContentDirectoryController.pageInfo = newPageInfo;
        // UI & React callbacks
        navigateCallback = navigate;
        waitingDialogCallbacks = waitingDialog;
        alertDialogCallbacks = alertDialog;
        Rename.callbacks = renameDialog;
        Move.callbacks = moveDialog;
        CreateItem.callbacks = createDialog;
        Delete.callbacks = deleteDialog;
        Upload.callbacks = uploadDialog;
        let directoryUrl = Utils.padWithSlash(Utils.tryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo), ["contentItem", "url"]));
        ContentDirectoryController.isRoot = (directoryUrl == "/");
    }
    ContentDirectoryController.prepData = prepData;
    function getToolbar() {
        let commandBarItems = [
            {
                key: "newItem", text: "New", iconProps: { iconName: "Add" },
                subMenuProps: {
                    items: [
                        { key: "newMarkdown", text: "Markdown file", onClick: ContentDirectoryController.CreateItem.createMarkdown, iconProps: { iconName: "MarkDownLanguage" } },
                        { key: "newText", text: "Text file", onClick: ContentDirectoryController.CreateItem.createPlainText, iconProps: { iconName: "TextDocument" } },
                        { key: 'divider', name: '-', itemType: ContextualMenuItemType.Divider },
                        { key: "newDirectory", text: "Folder", onClick: ContentDirectoryController.CreateItem.createDirectory, iconProps: { iconName: "FolderHorizontal" } }
                    ]
                }
            },
            { key: "upload", text: "Upload", onClick: Upload.startSelection, iconProps: { iconName: "Upload" } }
        ];
        if (!ContentDirectoryController.isRoot) {
            commandBarItems.push({ key: "rename", text: "Rename", onClick: Rename.show, iconProps: { iconName: "Rename" } });
            commandBarItems.push({ key: "move", text: "Move", onClick: Move.show, iconProps: { iconName: "MoveToFolder" } });
            commandBarItems.push({ key: "delete", text: "Delete", onClick: Delete.show, iconProps: { iconName: "Delete" } });
        }
        return (React.createElement("div", { className: "pageCommands" },
            React.createElement(CommandBar, { items: commandBarItems })));
    }
    ContentDirectoryController.getToolbar = getToolbar;
    let Rename;
    (function (Rename) {
        Rename.callbacks = null;
        function show() {
            Rename.callbacks.setTrue();
        }
        Rename.show = show;
        function finish() {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                let fileName = Utils.trimString($("#renameInput", "").val());
                Rename.callbacks.setFalse();
                waitingDialogCallbacks.setTrue();
                let response = yield Workspaces.renameDirectory((_a = ContentDirectoryController.pageInfo === null || ContentDirectoryController.pageInfo === void 0 ? void 0 : ContentDirectoryController.pageInfo.contentItem) === null || _a === void 0 ? void 0 : _a.reactLocalUrl, fileName);
                waitingDialogCallbacks.setFalse();
                if (((_b = response === null || response === void 0 ? void 0 : response.actionStatus) === null || _b === void 0 ? void 0 : _b.isOk) == true) {
                    let newUrl = Utils.padWithSlash(Utils.trimString(response === null || response === void 0 ? void 0 : response.newUrl, ""), true, false);
                    Workspaces.clearTreeCache();
                    EventBus.dispatch("fileStructChanged");
                    navigateCallback("/workspace" + newUrl);
                }
                else {
                    let title = "Can't rename folder";
                    let desc = response.actionStatus.getDialogMessage();
                    alertDialogCallbacks.setTrue();
                    alertDialogCallbacks.setTitle(title);
                    alertDialogCallbacks.setContent(desc);
                }
            });
        }
        Rename.finish = finish;
        function cancel() {
            Rename.callbacks.setFalse();
        }
        Rename.cancel = cancel;
    })(Rename = ContentDirectoryController.Rename || (ContentDirectoryController.Rename = {}));
    let Move;
    (function (Move) {
        Move.callbacks = null;
        let pathOptions = null;
        let currentSelection = null;
        function show() { showAsync(); }
        Move.show = show;
        function showAsync() {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                //#region Get path list options
                if (pathOptions == null) {
                    waitingDialogCallbacks.setTrue();
                    let response = yield Workspaces.directoryPaths(ContentDirectoryController.pageInfo.workspace.url);
                    if (((_a = response === null || response === void 0 ? void 0 : response.actionStatus) === null || _a === void 0 ? void 0 : _a.isOk) != true) {
                        waitingDialogCallbacks.setFalse();
                        let title = "Can't get folder list";
                        let desc = response.actionStatus.getDialogMessage();
                        alertDialogCallbacks.setTrue();
                        alertDialogCallbacks.setTitle(title);
                        alertDialogCallbacks.setContent(desc);
                        return;
                    }
                    let options = [{ key: "/", text: "/" }];
                    let thisPath = Utils.padWithSlash((_b = ContentDirectoryController.pageInfo === null || ContentDirectoryController.pageInfo === void 0 ? void 0 : ContentDirectoryController.pageInfo.contentItem) === null || _b === void 0 ? void 0 : _b.url, false, true);
                    if (Utils.arrayHasValues(response === null || response === void 0 ? void 0 : response.data)) {
                        for (let x = 0; x < response.data.length; x++) {
                            let path = response.data[x];
                            if ((path.startsWith(thisPath)) || (path == thisPath))
                                continue;
                            options.push({ key: path, text: path });
                        }
                    }
                    pathOptions = options;
                    waitingDialogCallbacks.setFalse();
                }
                //#endregion
                Move.callbacks.setDirectories(pathOptions);
                currentSelection = ContentDirectoryController.pageInfo.contentItem.getParentPath();
                Move.callbacks.setTrue();
            });
        }
        Move.showAsync = showAsync;
        function finish() {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                let newParent = currentSelection;
                Move.callbacks.setFalse();
                waitingDialogCallbacks.setTrue();
                let response = yield Workspaces.moveDirectory((_a = ContentDirectoryController.pageInfo === null || ContentDirectoryController.pageInfo === void 0 ? void 0 : ContentDirectoryController.pageInfo.contentItem) === null || _a === void 0 ? void 0 : _a.reactLocalUrl, newParent);
                waitingDialogCallbacks.setFalse();
                if (((_b = response === null || response === void 0 ? void 0 : response.actionStatus) === null || _b === void 0 ? void 0 : _b.isOk) == true) {
                    let newUrl = Utils.padWithSlash(Utils.trimString(response === null || response === void 0 ? void 0 : response.newUrl, ""), true, false);
                    Workspaces.clearTreeCache();
                    EventBus.dispatch("fileStructChanged");
                    navigateCallback("/workspace" + newUrl);
                }
                else {
                    let title = "Can't move folder";
                    let desc = response.actionStatus.getDialogMessage();
                    alertDialogCallbacks.setTrue();
                    alertDialogCallbacks.setTitle(title);
                    alertDialogCallbacks.setContent(desc);
                }
            });
        }
        Move.finish = finish;
        function cancel() {
            Move.callbacks.setFalse();
        }
        Move.cancel = cancel;
        function onSelectionChange(event, option, index) {
            currentSelection = Utils.parseString(option === null || option === void 0 ? void 0 : option.key);
        }
        Move.onSelectionChange = onSelectionChange;
    })(Move = ContentDirectoryController.Move || (ContentDirectoryController.Move = {}));
    let CreateItem;
    (function (CreateItem) {
        CreateItem.callbacks = null;
        let currentItemType;
        let title = null;
        let label = null;
        let suffix = null;
        function createMarkdown() {
            currentItemType = Workspaces.ContentItemType.File;
            title = "New Markdown file";
            label = "File name:";
            suffix = ".md";
            show();
        }
        CreateItem.createMarkdown = createMarkdown;
        function createPlainText() {
            currentItemType = Workspaces.ContentItemType.File;
            title = "New plain text file";
            label = "File name:";
            suffix = ".txt";
            show();
        }
        CreateItem.createPlainText = createPlainText;
        function createDirectory() {
            currentItemType = Workspaces.ContentItemType.Directory;
            title = "New directory";
            label = "Directory name:";
            suffix = undefined;
            show();
        }
        CreateItem.createDirectory = createDirectory;
        function show() {
            CreateItem.callbacks.setLabel(label);
            CreateItem.callbacks.setContent({ title: title });
            CreateItem.callbacks.setSuffix(suffix);
            CreateItem.callbacks.setTrue();
        }
        function finish() {
            var _a, _b, _c, _d;
            return __awaiter(this, void 0, void 0, function* () {
                let fileName = Utils.trimString($("#createInput", "").val()) + Utils.trimString(suffix, "");
                console.log(fileName);
                CreateItem.callbacks.setFalse();
                waitingDialogCallbacks.setTrue();
                let response = null;
                switch (currentItemType) {
                    case Workspaces.ContentItemType.File: {
                        response = yield Workspaces.createFile((_a = ContentDirectoryController.pageInfo === null || ContentDirectoryController.pageInfo === void 0 ? void 0 : ContentDirectoryController.pageInfo.contentItem) === null || _a === void 0 ? void 0 : _a.reactLocalUrl, fileName);
                        break;
                    }
                    case Workspaces.ContentItemType.Directory: {
                        response = yield Workspaces.createDirectory((_b = ContentDirectoryController.pageInfo === null || ContentDirectoryController.pageInfo === void 0 ? void 0 : ContentDirectoryController.pageInfo.contentItem) === null || _b === void 0 ? void 0 : _b.reactLocalUrl, fileName);
                        break;
                    }
                }
                waitingDialogCallbacks.setFalse();
                if (((_c = response === null || response === void 0 ? void 0 : response.actionStatus) === null || _c === void 0 ? void 0 : _c.isOk) == true) {
                    let newUrl = Utils.trimString((_d = response === null || response === void 0 ? void 0 : response.data) === null || _d === void 0 ? void 0 : _d.reactLocalUrl, "");
                    Workspaces.clearTreeCache();
                    EventBus.dispatch("fileStructChanged");
                    navigateCallback("/workspace" + newUrl);
                }
                else {
                    let title = "Can't rename folder";
                    let desc = response.actionStatus.getDialogMessage();
                    alertDialogCallbacks.setTrue();
                    alertDialogCallbacks.setTitle(title);
                    alertDialogCallbacks.setContent(desc);
                }
            });
        }
        CreateItem.finish = finish;
        function cancel() {
            CreateItem.callbacks.setFalse();
        }
        CreateItem.cancel = cancel;
    })(CreateItem = ContentDirectoryController.CreateItem || (ContentDirectoryController.CreateItem = {}));
    let Delete;
    (function (Delete) {
        Delete.callbacks = null;
        function show() {
            Delete.callbacks.setTrue();
        }
        Delete.show = show;
        function finish() {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                let fileName = Utils.trimString($("#renameInput", "").val());
                Delete.callbacks.setFalse();
                waitingDialogCallbacks.setTrue();
                let response = yield Workspaces.deleteItem((_a = ContentDirectoryController.pageInfo === null || ContentDirectoryController.pageInfo === void 0 ? void 0 : ContentDirectoryController.pageInfo.contentItem) === null || _a === void 0 ? void 0 : _a.reactLocalUrl);
                waitingDialogCallbacks.setFalse();
                if (((_b = response === null || response === void 0 ? void 0 : response.actionStatus) === null || _b === void 0 ? void 0 : _b.isOk) == true) {
                    let parentUrl = Utils.padWithSlash(Utils.trimString(response === null || response === void 0 ? void 0 : response.parentReactLocalUrl, ""), true, false);
                    Workspaces.clearTreeCache();
                    EventBus.dispatch("fileStructChanged");
                    navigateCallback("/workspace" + parentUrl);
                }
                else {
                    let title = "Can't delete folder";
                    let desc = response.actionStatus.getDialogMessage();
                    alertDialogCallbacks.setTrue();
                    alertDialogCallbacks.setTitle(title);
                    alertDialogCallbacks.setContent(desc);
                }
            });
        }
        Delete.finish = finish;
        function cancel() {
            Delete.callbacks.setFalse();
        }
        Delete.cancel = cancel;
    })(Delete = ContentDirectoryController.Delete || (ContentDirectoryController.Delete = {}));
    let Upload;
    (function (Upload) {
        /*
         * Upload sequence:
         * 1. Select files (triggered from menu)
         * 2. Pre-check - check if files already exist
         * 3. If any conflicts, ask whether to skip or overwrite these files
         * 4. Upload non-conflicted or all files
         * 5. Refresh navigation (file structure)
         */
        Upload.callbacks = null;
        let files = null;
        let conflictedFiles = null;
        let hasAnyConflicts = false;
        let hasAnyNewFiles = false;
        let wasAnythingUploaded = false;
        let issues = null;
        function reset() {
            console.log("Resetting");
            files = null;
            hasAnyConflicts = false;
            hasAnyNewFiles = false;
            conflictedFiles = [];
            wasAnythingUploaded = false;
            issues = null;
        }
        Upload.reset = reset;
        function startSelection() {
            $("#uploadFileInput").trigger("click");
        }
        Upload.startSelection = startSelection;
        function onUploadSelection(e) {
            files = Utils.tryGet(e, ["target", "files"]);
            startProcess();
        }
        Upload.onUploadSelection = onUploadSelection;
        function startProcess() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    if ((files == null) || (files.length <= 0)) {
                        reset();
                    }
                    waitingDialogCallbacks.setTrue();
                    // First check for conflicts
                    preCheck();
                }
                catch (e) {
                    reset();
                }
            });
        }
        function preCheck() {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                hasAnyConflicts = false;
                hasAnyNewFiles = false;
                conflictedFiles = [];
                let request = null;
                //#region Prepare request data
                {
                    let clientFiles = [];
                    try {
                        if (files != null) {
                            for (let x = 0; x < files.length; x++) {
                                clientFiles.push(new Workspaces.PreUploadCheck.ClientFile((_a = files[x]) === null || _a === void 0 ? void 0 : _a.name));
                            }
                        }
                    }
                    catch (e) { }
                    request = new Workspaces.PreUploadCheck.Request((_b = ContentDirectoryController.pageInfo === null || ContentDirectoryController.pageInfo === void 0 ? void 0 : ContentDirectoryController.pageInfo.contentItem) === null || _b === void 0 ? void 0 : _b.reactLocalUrl, clientFiles);
                }
                //#endregion
                // Fetch from server
                let response = yield Workspaces.PreUploadCheck.check(request);
                //#region Process response
                if (Utils.arrayHasValues(response === null || response === void 0 ? void 0 : response.files)) {
                    for (let x = 0; x < response.files.length; x++) {
                        let file = response.files[x];
                        if (file == null)
                            continue;
                        switch (file.status) {
                            case Workspaces.PreUploadCheck.FileStatusType.AlreadyExists: {
                                conflictedFiles.push();
                                hasAnyConflicts = true;
                                break;
                            }
                            case Workspaces.PreUploadCheck.FileStatusType.OK: {
                                hasAnyNewFiles = true;
                                break;
                            }
                        }
                    }
                }
                //#endregion
                //#region There are conflicts: Ask what to do
                if (hasAnyConflicts) {
                    //callbacks.setHasAnyNewFiles(hasAnyNewFiles);
                    if (hasAnyNewFiles)
                        Upload.callbacks.showOverwriteMixed();
                    else
                        Upload.callbacks.showOverwrite();
                    return;
                }
                //#endregion
                //#region Ony new files
                if ((!hasAnyConflicts) && (hasAnyNewFiles)) {
                    uploadNewFiles();
                    return;
                }
                //#endregion
                // Nothing to upload
                reset();
            });
        }
        //function getFileList(): File[] {
        //	let list: File[] = [];
        //	if (files?.length > 0) {
        //		for (let x = 0; x < files.length; x++) {
        //			list.push(files[x]);
        //		}
        //	}
        //	return list;
        //}
        function uploadAndOverwrite() {
            return __awaiter(this, void 0, void 0, function* () {
                yield uploadSelected(files);
                wrapUp();
            });
        }
        Upload.uploadAndOverwrite = uploadAndOverwrite;
        function uploadNewFiles() {
            return __awaiter(this, void 0, void 0, function* () {
                let list = [];
                if ((files === null || files === void 0 ? void 0 : files.length) > 0) {
                    for (let x = 0; x < files.length; x++) {
                        let file = files[x];
                        if ((conflictedFiles === null || conflictedFiles === void 0 ? void 0 : conflictedFiles.includes(file.name)) != true)
                            list.push(file);
                    }
                }
                yield uploadSelected(list);
                wrapUp();
            });
        }
        Upload.uploadNewFiles = uploadNewFiles;
        function uploadSelected(filesForUpload) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                if (issues == null)
                    issues = [];
                try {
                    if ((filesForUpload === null || filesForUpload === void 0 ? void 0 : filesForUpload.length) > 0) {
                        for (let x = 0; x < filesForUpload.length; x++) {
                            let response = yield Workspaces.uploadFile((_a = ContentDirectoryController.pageInfo === null || ContentDirectoryController.pageInfo === void 0 ? void 0 : ContentDirectoryController.pageInfo.contentItem) === null || _a === void 0 ? void 0 : _a.reactLocalUrl, filesForUpload[x]);
                            if ((response === null || response === void 0 ? void 0 : response.actionStatus) != null) {
                                if (response.actionStatus.isOk) {
                                    wasAnythingUploaded = true;
                                    Workspaces.clearTreeCache();
                                    EventBus.dispatch("fileStructChanged");
                                }
                                else {
                                    let issue = filesForUpload[x].name + ": " + response.actionStatus.getDialogMessage();
                                    issues.push(issue);
                                }
                            }
                        }
                    }
                }
                catch (e) { }
            });
        }
        function wrapUp() {
            let issuesText = null;
            let issueCount = 0;
            let uploadedAnything = wasAnythingUploaded;
            if (Utils.arrayHasValues(issues)) {
                issuesText = issues.join("\n");
                issueCount = issues.length;
            }
            closeAndReset();
            if ((issuesText != null) && (issueCount > 0)) {
                let title = uploadedAnything ? "Can't upload everything" : "Can't upload";
                alertDialogCallbacks.setTrue();
                alertDialogCallbacks.setTitle(title);
                alertDialogCallbacks.setContent(issuesText);
            }
        }
        function closeAndReset() {
            reset();
            waitingDialogCallbacks.setFalse();
            Upload.callbacks.hideOverwriteMixed();
            Upload.callbacks.hideOverwrite();
        }
        Upload.closeAndReset = closeAndReset;
    })(Upload = ContentDirectoryController.Upload || (ContentDirectoryController.Upload = {}));
})(ContentDirectoryController || (ContentDirectoryController = {}));
//# sourceMappingURL=ContentDirectory.js.map