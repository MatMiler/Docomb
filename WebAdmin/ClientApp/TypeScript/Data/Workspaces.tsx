import { LayoutUtils } from '../LayoutUtils';
import { Apis } from './Apis';
import { SessionCache } from './SessionCache';
import { Utils } from './Utils';

export module Workspaces {
	/** Load a list of workspaces */
	export async function loadWorkspaceList(): Promise<Array<Workspace>> {
		let list: Array<Workspace> = [];
		let data = await Apis.fetchJsonAsync("api/general/workspaces", true);
		if (Utils.arrayHasValues(data)) {
			for (let x = 0; x < data.length; x++) {
				let item: Workspace = new Workspace(data[x]);
				if ((item != null) && (item.isValid() == true))
					list.push(item);
			}
		}

		return list;
	}


	export async function loadPageInfo(url: string, query: string): Promise<WorkspacePageInfo> {
		let data: any = await Apis.fetchJsonAsync("api/general/workspacePageInfo?url=" + encodeURI(url) + "&query=" + encodeURI(query), false);
		let item: WorkspacePageInfo = new WorkspacePageInfo(data);
		return ((item != null) && (item.isValid())) ? item : null;
	}


	//export async function loadFileDetails(url: string): Promise<FileDetails> {
	//	let data: any = await Apis.fetchJsonAsync("api/content/fileDetails?url=" + encodeURI(url), false);
	//	return FileDetails.create(data);
	//}


	export async function loadTree(workspaceUrl: string): Promise<Array<ContentItem>> {
		let list: Array<ContentItem> = [];
		let url = "api/general/workspaceContentTree?workspaceUrl=" + encodeURI(workspaceUrl);

		let data = null;
		let storedItem: SessionCache.Item = SessionCache.getItem(url);
		if ((storedItem != null) && (storedItem.value != null)) {
			data = storedItem.value;
		} else {
			data = await Apis.fetchJsonAsync(url, true);
			LayoutUtils.WindowData.set("workspaceTreeTimestamp-" + encodeURI(workspaceUrl), Date.now());
		}

		if (Utils.arrayHasValues(data)) {
			for (let x = 0; x < data.length; x++) {
				let item: ContentItem = new ContentItem(data[x]);
				if ((item != null) && (item.isValid() == true))
					list.push(item);
			}
		}
		return list;
	}


	export function clearTreeCache(workspaceUrl?: string): void {
		if (workspaceUrl == null) {
			workspaceUrl = Utils.tryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspaceData), "url");
		}
		let url = "api/general/workspaceContentTree?workspaceUrl=" + encodeURI(workspaceUrl);
		SessionCache.remove(url);
	}


	/** Workspace information */
	export class Workspace {
		/** Name of the workspace (site name) */
		public name: string = null;
		/** URL of the workspace */
		public url: string = null;
		/** Local URL of the workspace for React */
		public reactLocalUrl: string = null;
		/** Initials to display as icon if icon is missing */
		public initials: string = null;
		/** Representation of the workspace */
		public icon: string = null;
		/** Information about how the workspace content is stored */
		public storage: WorkspaceStorage = null;

		/** Quick check if data is valid */
		public isValid(): boolean {
			return ((typeof this.name == "string") && (this.name.length > 0) && (typeof this.reactLocalUrl == "string") && (this.reactLocalUrl.length > 0));
		}

		public constructor(source: any) {
			this.name = Utils.tryGetString(source, "name");
			this.url = Utils.tryGetString(source, "url");
			this.reactLocalUrl = Utils.tryGetString(source, "reactLocalUrl");
			this.initials = Utils.tryGetString(source, "initials");
			this.icon = Utils.tryGetString(source, "icon");
			this.storage = new WorkspaceStorage(Utils.tryGet(source, "storage"));
		}

		public static create(source: any): Workspace {
			let item = new Workspace(source);
			return (item?.isValid() == true) ? item : null;
		}
	}
	export class WorkspaceStorage {
		/** Whether workspace has a Git repository */
		public hasGit: boolean = false;

		public constructor(source: any) {
			this.hasGit = Utils.tryGetBool(source, "hasGit", false);
		}
	}



	export enum ContentItemType {
		Directory = "Directory",
		File = "File"
	}
	export class ContentItem {
		public type: ContentItemType;
		public name: string;
		public url: string;
		public reactLocalUrl: string;
		public children: Array<ContentItem>;

		/** Quick check if data is valid */
		public isValid(): boolean {
			return ((typeof this.name == "string") && (this.name.length > 0) && (typeof this.reactLocalUrl == "string") && (this.reactLocalUrl.length > 0));
		}

		public constructor(source: any) {
			this.type = Utils.tryGetEnum(source, "type", ContentItemType);
			this.name = Utils.tryGetString(source, "name");
			this.url = Utils.tryGetString(source, "url");
			this.reactLocalUrl = Utils.tryGetString(source, "reactLocalUrl");

			if ((Utils.trimString(this.name, null) == null) && ((this.url == "/") || (this.url == "") || (this.url == null)))
				this.name = "/";

			let sourceChildren = Utils.tryGet(source, "children");
			let children: Array<ContentItem> = [];
			if (Utils.arrayHasValues(sourceChildren)) {
				for (let x = 0; x < sourceChildren.length; x++) {
					let item: ContentItem = new ContentItem(sourceChildren[x]);
					if ((item != null) && (item.isValid() == true))
						children.push(item);
				}
			}
			this.children = children;
		}

		public static create(source: any): ContentItem {
			let item = new ContentItem(source);
			return (item?.isValid() == true) ? item : null;
		}

		public getParentPath(): string {
			if ((this.url == null) || (this.url?.length <= 0)) return "/";
			let parts: string[] = Utils.mapArray(this.url.split("/"), x => Utils.trimString(x, null), null, false);
			if (Utils.arrayHasValues(parts)) {
				let parentPaths: string[] = [];
				for (let x = 0; x < parts.length - 1; x++) {
					parentPaths.push(parts[x]);
				}
				return parentPaths.join("/") + "/";
			}
			return "/";
		}
	}

	export enum ContentItemAction {
		View = "View",
		Edit = "Edit"
	}
	export class WorkspacePageInfo {
		public workspace: Workspace;
		public contentItem: ContentItem;
		public details: FileDetails;
		public action: ContentItemAction;
		public breadcrumbs: Array<ContentItem>;

		public isValid(): boolean {
			return ((this.workspace != null) && (this.workspace.isValid()) && (this.contentItem != null) && (this.contentItem.isValid()));
		}

		public constructor(source: any) {
			this.workspace = Workspace.create(Utils.tryGet(source, "workspace"));
			this.contentItem = ContentItem.create(Utils.tryGet(source, "contentItem"));
			this.details = FileDetails.create(Utils.tryGet(source, "details"));
			this.breadcrumbs = Utils.mapArray<ContentItem>(Utils.tryGet(source, "breadcrumbs"), x => ContentItem.create(x));
			this.action = Utils.tryGetEnum(source, "action", ContentItemAction, ContentItemAction.View);
		}
	}


	export enum FileType {
		File = "File",
		Markdown = "Markdown",
		Html = "Html",
		PlainText = "PlainText"
	}
	export class FileDetails {
		public title: string;
		public fileName: string;
		public url: string;
		public reactLocalUrl: string;
		public type: FileType;
		public workspace: Workspace;
		public fileSize: number;
		public fileSizeDesc: string;
		public lastModifiedDate: Date;
		public contentText: string;
		public contentHtml: string;

		public isValid(): boolean {
			return ((typeof this.fileName == "string") && (this.fileName.length > 0) && (typeof this.type == "string") && (this.type.length > 0));
		}

		public constructor(source: any) {
			this.title = Utils.tryGetString(source, "title");
			this.fileName = Utils.tryGetString(source, "fileName");
			this.url = Utils.tryGetString(source, "url");
			this.reactLocalUrl = Utils.tryGetString(source, "reactLocalUrl");
			this.type = Utils.tryGetEnum(source, "type", FileType, FileType.File);
			this.workspace = Workspace.create(Utils.tryGet(source, "workspace"));
			this.fileSize = Utils.tryGetNumber(source, "fileSize");
			this.fileSizeDesc = Utils.tryGetString(source, "fileSizeDesc");
			this.lastModifiedDate = Utils.tryGetDate(source, "lastModifiedDate");
			this.contentText = Utils.tryGetString(source, "contentText");
			this.contentHtml = Utils.tryGetString(source, "contentHtml");
		}

		public static create(source: any): FileDetails {
			let item = new FileDetails(source);
			return (item?.isValid() == true) ? item : null;
		}
	}



	export class MoveResponse {
		//public success: boolean;
		public actionStatus: Apis.ActionStatus;
		public oldUrl: string;
		public newUrl: string;

		public constructor(source: any) {
			this.actionStatus = new Apis.ActionStatus(Utils.tryGet(source, "actionStatus"));
			this.oldUrl = Utils.tryGetString(source, "oldUrl");
			this.newUrl = Utils.tryGetString(source, "newUrl");
		}
	}


	export async function renameFile(url: string, newName: string): Promise<MoveResponse> {
		let data = null;
		data = await Apis.postJsonAsync("api/content/renameFile", { url: url, fileName: newName });
		return new MoveResponse(data);
	}


	export async function moveFile(url: string, newParent: string): Promise<MoveResponse> {
		let data = null;
		data = await Apis.postJsonAsync("api/content/moveFile", { url: url, parent: newParent });
		return new MoveResponse(data);
	}


	export async function renameDirectory(url: string, newName: string): Promise<MoveResponse> {
		let data = null;
		data = await Apis.postJsonAsync("api/content/renameDirectory", { url: url, fileName: newName });
		return new MoveResponse(data);
	}


	export async function moveDirectory(url: string, newParent: string): Promise<MoveResponse> {
		let data = null;
		data = await Apis.postJsonAsync("api/content/moveDirectory", { url: url, parent: newParent });
		return new MoveResponse(data);
	}


	export async function directoryPaths(workspaceUrl: string): Promise<Apis.DataWithStatus<string[]>> {
		let source: any = await Apis.fetchJsonAsync("api/general/workspeceDirectoryPaths?workspaceUrl=" + encodeURI(workspaceUrl), false);
		let actionStatus = new Apis.ActionStatus(Utils.tryGet(source, "actionStatus"));
		let list: string[] = null;
		if (actionStatus?.isOk == true)
			list = Utils.mapArray(Utils.tryGet(source, "data"), x => Utils.trimString(x, null), x => (x != null));
		return new Apis.DataWithStatus(actionStatus, list);
	}

	export async function createFile(parentUrl: string, fileName: string): Promise<Apis.DataWithStatus<ContentItem>> {
		let response = null;
		response = await Apis.postJsonAsync("api/content/createFile", { parent: parentUrl, fileName: fileName });
		let actionStatus = new Apis.ActionStatus(Utils.tryGet(response, "actionStatus"));
		let item: ContentItem;
		if (actionStatus?.isOk == true)
			item = new ContentItem(Utils.tryGet(response, "data"));
		return new Apis.DataWithStatus(actionStatus, item);
	}

	export async function createDirectory(parentUrl: string, fileName: string): Promise<Apis.DataWithStatus<ContentItem>> {
		let response = null;
		response = await Apis.postJsonAsync("api/content/createDirectory", { parent: parentUrl, fileName: fileName });
		let actionStatus = new Apis.ActionStatus(Utils.tryGet(response, "actionStatus"));
		let item: ContentItem;
		if (actionStatus?.isOk == true)
			item = new ContentItem(Utils.tryGet(response, "data"));
		return new Apis.DataWithStatus(actionStatus, item);
	}


	export class DeleteItemResponse {
		public actionStatus: Apis.ActionStatus;
		public parentUrl: string;
		public parentReactLocalUrl: string;

		public constructor(source: any) {
			this.actionStatus = new Apis.ActionStatus(Utils.tryGet(source, "actionStatus"));
			this.parentUrl = Utils.tryGetString(source, "parentUrl");
			this.parentReactLocalUrl = Utils.tryGetString(source, "parentReactLocalUrl");
		}
	}

	export async function deleteItem(url: string): Promise<DeleteItemResponse> {
		let response = null;
		response = await Apis.postJsonAsync("api/content/deleteItem", { url: url });
		return new DeleteItemResponse(response);
	}



	export module PreUploadCheck {
		export class Request {
			public parentUrl: string;
			public files: ClientFile[];

			public constructor(parentUrl: string = null, files: ClientFile[] = null) {
				this.parentUrl = parentUrl;
				this.files = files;
			}
		}
		export class ClientFile {
			public name: string;

			public constructor(name: string = null) {
				this.name = name;
			}
		}
		export enum FileStatusType {
			OK = "OK",
			AlreadyExists = "AlreadyExists"
		}
		export class Response {
			public actionStatus: Apis.ActionStatus;
			public files: FileStatus[];

			public constructor(source: any) {
				this.actionStatus = new Apis.ActionStatus(Utils.tryGet(source, "actionStatus"));
				this.files = Utils.mapArray(Utils.tryGet(source, "files"), x => new FileStatus(x), x => (x?.name?.length > 0), false);
			}
		}
		export class FileStatus {
			public name: string;
			public status: FileStatusType;

			public constructor(source: any) {
				this.name = Utils.tryGetString(source, "name");
				this.status = Utils.tryGetEnum(source, "status", FileStatusType);
			}
		}

		export async function check(request: Request): Promise<Response> {
			let response = null;
			response = await Apis.postJsonAsync("api/content/preUploadCheck", request);
			return new Response(response);
		}

	}


	export async function uploadFile(parentUrl: string, file: File): Promise<Apis.DataWithStatus<ContentItem>> {
		let response = null;
		let form: FormData = new FormData();
		form.append("parentUrl", parentUrl);
		form.append("file", file);
		response = await Apis.postFormAsync("api/content/uploadFile", form);
		let actionStatus = new Apis.ActionStatus(Utils.tryGet(response, "actionStatus"));
		let item: ContentItem;
		if (actionStatus?.isOk == true)
			item = new ContentItem(Utils.tryGet(response, "data"));
		return new Apis.DataWithStatus(actionStatus, item);
	}

}
