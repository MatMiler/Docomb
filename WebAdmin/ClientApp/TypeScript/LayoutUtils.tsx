import { Utils } from "./Data/Utils";
import { Workspaces } from "./Data/Workspaces";
import $ from 'jquery';

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
			return Utils.tryGet(window, [windowProperty, key]);
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
			let readerBasePath: string = Utils.padWithSlash(Utils.tryGetString(window, "readerBasePath"), false, true);
			readerBasePath = Utils.padWithSlash(readerBasePath = workspace?.url, false, true);
			let pageBasePath = Utils.concatUrlPaths(readerBasePath, contentItem?.url);
			let pageBasePathParts = new Utils.UrlParts(pageBasePath);
			container.find("a").each((index: number, element: HTMLAnchorElement) => {
				let a = $(element);
				a.attr("target", "_blank");
				let href = a.attr("href");
				a.attr("href", pageBasePathParts.combineWithPath(href));
			});
			html = container.html();
		}
		catch (e) { }


		return html;
	}



}

