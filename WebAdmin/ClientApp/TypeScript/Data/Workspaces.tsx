import { LayoutUtils } from '../LayoutUtils';
import { Apis } from './Apis';
import { SessionCache } from './SessionCache';
import { Utils } from './Utils';

export module Workspaces {
	/** Load a list of workspaces */
	export async function loadWorkspaceList(): Promise<Array<Workspace>> {
		let list: Array<Workspace> = [];
		let data = await Apis.fetchJsonAsync("api/general/workspaces", true);
		if (Utils.ArrayHasValues(data)) {
			for (let x = 0; x < data.length; x++) {
				let item: Workspace = new Workspace(data[x]);
				if ((item != null) && (item.isValid() == true))
					list.push(item);
			}
		}

		return list;
	}


	export async function loadPageInfo(url: string): Promise<WorkspacePageInfo> {
		let data: any = await Apis.fetchJsonAsync("api/general/workspacePageInfo?url=" + encodeURI(url), false);
		let item: WorkspacePageInfo = new WorkspacePageInfo(data);
		return ((item != null) && (item.isValid())) ? item : null;
	}


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

		if (Utils.ArrayHasValues(data)) {
			for (let x = 0; x < data.length; x++) {
				let item: ContentItem = new ContentItem(data[x]);
				if ((item != null) && (item.isValid() == true))
					list.push(item);
			}
		}
		return list;
	}


	/** Workspace information */
	export class Workspace {
		/** Name of the workspace (site name) */
		public name: string = null;
		/** URL of the workspace */
		public url: string = null;
		/** Local URL of the workspace for React */
		public localUrl: string = null;
		/** Initials to display as icon if icon is missing */
		public initials: string = null;
		/** Representation of the workspace */
		public icon: string = null;

		/** Quick check if data is valid */
		public isValid(): boolean {
			return ((typeof this.name == "string") && (this.name.length > 0) && (typeof this.localUrl == "string") && (this.localUrl.length > 0));
		}

		public constructor(source: any) {
			this.name = Utils.TryGetString(source, "name");
			this.url = Utils.TryGetString(source, "url");
			this.localUrl = Utils.TryGetString(source, "localUrl");
			this.initials = Utils.TryGetString(source, "initials");
			this.icon = Utils.TryGetString(source, "icon");
		}

		public static create(source: any): Workspace {
			let item = new Workspace(source);
			return (item?.isValid() == true) ? item : null;
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
		public localUrl: string;
		public children: Array<ContentItem>;

		/** Quick check if data is valid */
		public isValid(): boolean {
			return ((typeof this.name == "string") && (this.name.length > 0) && (typeof this.localUrl == "string") && (this.localUrl.length > 0));
		}

		public constructor(source: any) {
			this.type = Utils.TryGetEnum(source, "type", ContentItemType);
			this.name = Utils.TryGetString(source, "name");
			this.url = Utils.TryGetString(source, "url");
			this.localUrl = Utils.TryGetString(source, "localUrl");

			if ((Utils.TrimString(this.name, null) == null) && ((this.url == "/") || (this.url == "") || (this.url == null)))
				this.name = "/";

			let sourceChildren = Utils.TryGet(source, "children");
			let children: Array<ContentItem> = [];
			if (Utils.ArrayHasValues(sourceChildren)) {
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
	}

	export enum ContentItemAction {
		View = "View",
		Edit = "Edit"
	}
	export class WorkspacePageInfo {
		public workspace: Workspace;
		public contentItem: ContentItem;
		public action: ContentItemAction;
		public breadcrumbs: Array<ContentItem>;

		public isValid(): boolean {
			return ((this.workspace != null) && (this.workspace.isValid()) && (this.contentItem != null) && (this.contentItem.isValid()));
		}

		public constructor(source: any) {
			this.workspace = Workspace.create(Utils.TryGet(source, "workspace"));
			this.contentItem = ContentItem.create(Utils.TryGet(source, "contentItem"));
			this.breadcrumbs = Utils.MapArray<ContentItem>(Utils.TryGet(source, "breadcrumbs"), x => ContentItem.create(x));
			this.action = Utils.TryGetEnum(source, "action", ContentItemAction, ContentItemAction.View);
		}
	}


}
