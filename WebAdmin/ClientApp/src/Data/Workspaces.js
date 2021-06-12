var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Apis } from './Apis';
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
    function loadPageInfo(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield Apis.fetchJsonAsync("api/general/workspacePageInfo?url=" + encodeURI(url), false);
            let item = new WorkspacePageInfo(data);
            return ((item != null) && (item.isValid())) ? item : null;
        });
    }
    Workspaces.loadPageInfo = loadPageInfo;
    /** Workspace information */
    class Workspace {
        constructor(source) {
            /** Name of the workspace (site name) */
            this.name = null;
            /** URL of the workspace */
            this.url = null;
            /** Local URL of the workspace for React */
            this.localUrl = null;
            /** Initials to display as icon if icon is missing */
            this.initials = null;
            /** Representation of the workspace */
            this.icon = null;
            this.name = Utils.TryGetString(source, "name");
            this.url = Utils.TryGetString(source, "url");
            this.localUrl = Utils.TryGetString(source, "localUrl");
            this.initials = Utils.TryGetString(source, "initials");
            this.icon = Utils.TryGetString(source, "icon");
        }
        /** Quick check if data is valid */
        isValid() {
            return ((typeof this.name == "string") && (this.name.length > 0) && (typeof this.localUrl == "string") && (this.localUrl.length > 0));
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
            this.localUrl = Utils.TryGetString(source, "localUrl");
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
            return ((typeof this.name == "string") && (this.name.length > 0) && (typeof this.localUrl == "string") && (this.localUrl.length > 0));
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
            let workspace = new Workspace(Utils.TryGet(source, "workspace"));
            let contentItem = new ContentItem(Utils.TryGet(source, "contentItem"));
            if ((workspace != null) && (workspace.isValid()))
                this.workspace = workspace;
            if ((contentItem != null) && (contentItem.isValid()))
                this.contentItem = contentItem;
            this.action = Utils.TryGetEnum(source, "action", ContentItemAction, ContentItemAction.View);
        }
        isValid() {
            return ((this.workspace != null) && (this.workspace.isValid()) && (this.contentItem != null) && (this.contentItem.isValid()));
        }
    }
    Workspaces.WorkspacePageInfo = WorkspacePageInfo;
})(Workspaces || (Workspaces = {}));
//# sourceMappingURL=Workspaces.js.map