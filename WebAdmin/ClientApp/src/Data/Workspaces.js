var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { LayoutUtils } from '../LayoutUtils';
import { Apis } from './Apis';
import { SessionCache } from './SessionCache';
import { Utils } from './Utils';
export var Workspaces;
(function (Workspaces) {
    /** Load a list of workspaces */
    function loadWorkspaceList() {
        return __awaiter(this, void 0, void 0, function* () {
            let list = [];
            let data = yield Apis.fetchJsonAsync("api/general/workspaces", true);
            if (Utils.ArrayHasValues(data)) {
                for (let x = 0; x < data.length; x++) {
                    let item = new Workspace(data[x]);
                    if ((item != null) && (item.isValid() == true))
                        list.push(item);
                }
            }
            return list;
        });
    }
    Workspaces.loadWorkspaceList = loadWorkspaceList;
    function loadPageInfo(url, query) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield Apis.fetchJsonAsync("api/general/workspacePageInfo?url=" + encodeURI(url) + "&query=" + encodeURI(query), false);
            let item = new WorkspacePageInfo(data);
            return ((item != null) && (item.isValid())) ? item : null;
        });
    }
    Workspaces.loadPageInfo = loadPageInfo;
    //export async function loadFileDetails(url: string): Promise<FileDetails> {
    //	let data: any = await Apis.fetchJsonAsync("api/content/fileDetails?url=" + encodeURI(url), false);
    //	return FileDetails.create(data);
    //}
    function loadTree(workspaceUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = [];
            let url = "api/general/workspaceContentTree?workspaceUrl=" + encodeURI(workspaceUrl);
            let data = null;
            let storedItem = SessionCache.getItem(url);
            if ((storedItem != null) && (storedItem.value != null)) {
                data = storedItem.value;
            }
            else {
                data = yield Apis.fetchJsonAsync(url, true);
                LayoutUtils.WindowData.set("workspaceTreeTimestamp-" + encodeURI(workspaceUrl), Date.now());
            }
            if (Utils.ArrayHasValues(data)) {
                for (let x = 0; x < data.length; x++) {
                    let item = new ContentItem(data[x]);
                    if ((item != null) && (item.isValid() == true))
                        list.push(item);
                }
            }
            return list;
        });
    }
    Workspaces.loadTree = loadTree;
    /** Workspace information */
    class Workspace {
        constructor(source) {
            /** Name of the workspace (site name) */
            this.name = null;
            /** URL of the workspace */
            this.url = null;
            /** Local URL of the workspace for React */
            this.reactLocalUrl = null;
            /** Initials to display as icon if icon is missing */
            this.initials = null;
            /** Representation of the workspace */
            this.icon = null;
            this.name = Utils.TryGetString(source, "name");
            this.url = Utils.TryGetString(source, "url");
            this.reactLocalUrl = Utils.TryGetString(source, "reactLocalUrl");
            this.initials = Utils.TryGetString(source, "initials");
            this.icon = Utils.TryGetString(source, "icon");
        }
        /** Quick check if data is valid */
        isValid() {
            return ((typeof this.name == "string") && (this.name.length > 0) && (typeof this.reactLocalUrl == "string") && (this.reactLocalUrl.length > 0));
        }
        static create(source) {
            let item = new Workspace(source);
            return ((item === null || item === void 0 ? void 0 : item.isValid()) == true) ? item : null;
        }
    }
    Workspaces.Workspace = Workspace;
    let ContentItemType;
    (function (ContentItemType) {
        ContentItemType["Directory"] = "Directory";
        ContentItemType["File"] = "File";
    })(ContentItemType = Workspaces.ContentItemType || (Workspaces.ContentItemType = {}));
    class ContentItem {
        constructor(source) {
            this.type = Utils.TryGetEnum(source, "type", ContentItemType);
            this.name = Utils.TryGetString(source, "name");
            this.url = Utils.TryGetString(source, "url");
            this.reactLocalUrl = Utils.TryGetString(source, "reactLocalUrl");
            if ((Utils.TrimString(this.name, null) == null) && ((this.url == "/") || (this.url == "") || (this.url == null)))
                this.name = "/";
            let sourceChildren = Utils.TryGet(source, "children");
            let children = [];
            if (Utils.ArrayHasValues(sourceChildren)) {
                for (let x = 0; x < sourceChildren.length; x++) {
                    let item = new ContentItem(sourceChildren[x]);
                    if ((item != null) && (item.isValid() == true))
                        children.push(item);
                }
            }
            this.children = children;
        }
        /** Quick check if data is valid */
        isValid() {
            return ((typeof this.name == "string") && (this.name.length > 0) && (typeof this.reactLocalUrl == "string") && (this.reactLocalUrl.length > 0));
        }
        static create(source) {
            let item = new ContentItem(source);
            return ((item === null || item === void 0 ? void 0 : item.isValid()) == true) ? item : null;
        }
    }
    Workspaces.ContentItem = ContentItem;
    let ContentItemAction;
    (function (ContentItemAction) {
        ContentItemAction["View"] = "View";
        ContentItemAction["Edit"] = "Edit";
    })(ContentItemAction = Workspaces.ContentItemAction || (Workspaces.ContentItemAction = {}));
    class WorkspacePageInfo {
        constructor(source) {
            this.workspace = Workspace.create(Utils.TryGet(source, "workspace"));
            this.contentItem = ContentItem.create(Utils.TryGet(source, "contentItem"));
            this.details = FileDetails.create(Utils.TryGet(source, "details"));
            this.breadcrumbs = Utils.MapArray(Utils.TryGet(source, "breadcrumbs"), x => ContentItem.create(x));
            this.action = Utils.TryGetEnum(source, "action", ContentItemAction, ContentItemAction.View);
        }
        isValid() {
            return ((this.workspace != null) && (this.workspace.isValid()) && (this.contentItem != null) && (this.contentItem.isValid()));
        }
    }
    Workspaces.WorkspacePageInfo = WorkspacePageInfo;
    let FileType;
    (function (FileType) {
        FileType["File"] = "File";
        FileType["Markdown"] = "Markdown";
        FileType["Html"] = "Html";
        FileType["PlainText"] = "PlainText";
    })(FileType = Workspaces.FileType || (Workspaces.FileType = {}));
    class FileDetails {
        constructor(source) {
            this.title = Utils.TryGetString(source, "title");
            this.fileName = Utils.TryGetString(source, "fileName");
            this.url = Utils.TryGetString(source, "url");
            this.reactLocalUrl = Utils.TryGetString(source, "reactLocalUrl");
            this.type = Utils.TryGetEnum(source, "type", FileType, FileType.File);
            this.workspace = Workspace.create(Utils.TryGet(source, "workspace"));
            this.fileSize = Utils.TryGetNumber(source, "fileSize");
            this.fileSizeDesc = Utils.TryGetString(source, "fileSizeDesc");
            this.lastModifiedDate = Utils.TryGetDate(source, "lastModifiedDate");
            this.contentText = Utils.TryGetString(source, "contentText");
            this.contentHtml = Utils.TryGetString(source, "contentHtml");
        }
        isValid() {
            return ((typeof this.fileName == "string") && (this.fileName.length > 0) && (typeof this.type == "string") && (this.type.length > 0));
        }
        static create(source) {
            let item = new FileDetails(source);
            return ((item === null || item === void 0 ? void 0 : item.isValid()) == true) ? item : null;
        }
    }
    Workspaces.FileDetails = FileDetails;
})(Workspaces || (Workspaces = {}));
//# sourceMappingURL=Workspaces.js.map