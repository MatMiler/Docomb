import { Utils } from "./Data/Utils";
import { Workspaces } from "./Data/Workspaces";

export module LayoutUtils {
	export module NavBar {
		export enum ItemKey {
			Home = "home",
			Settings = "settings"
		}

		export function updateNavBar() {
			this.setState();
		}
	}


	export module WindowData {

		export const windowProperty: string = "docombProp";

		export enum ItemKey {
			SelectedSideBarItem = "selectedSideBarItem",
			WorkspacePageInfo = "workspacePageInfo",
			WorkspaceData = "workspaceData",
			ContentItemData = "contentItemData"
		}


		export function get(key: ItemKey | string): any {
			return Utils.TryGet(window, [windowProperty, key]);
		}

		export function set(key: ItemKey | string, value: any): void {
			if (window[windowProperty] == null)
				window[windowProperty] = {};
			window[windowProperty][key] = value;
		}


	}



	export function fixLocalLinksInHtml(html: string, workspace: Workspaces.Workspace, contentItem: Workspaces.ContentItem): string {
		try {
			let container: JQuery<HTMLElement> = $("<div />").html(html);
			let readerBasePath: string = Utils.TryGetString(window, "readerBasePath");
			if (!readerBasePath.endsWith("/")) readerBasePath += "/";
			readerBasePath += workspace?.url;
			if (!readerBasePath.endsWith("/")) readerBasePath += "/";
			container.find("a").each((index: number, element: HTMLAnchorElement) => {
				let a = $(element);
				a.attr("target", "_blank");
				let href = a.attr("href");
				if (Utils.TrimString(href, null) != null) {
					let slashPos = href.indexOf("/");
					if (slashPos == 0) return;
					let hashPos = href.indexOf("#");
					let doubleSlashPos = href.indexOf("//");
					let paramPos = href.indexOf("?");
					if (hashPos < 0) hashPos = href.length;
					if (doubleSlashPos < 0) doubleSlashPos = href.length;
					if (paramPos < 0) paramPos = href.length;
					if ((doubleSlashPos >= hashPos) && (doubleSlashPos >= paramPos)) {
						href = readerBasePath + href;
						a.attr("href", href);
					}
				}
			});
			html = container.html();
		}
		catch (e) { }


		return html;
	}



}

