import React, { Component } from 'react';
import { INavLink, INavLinkGroup, Nav, Pivot, PivotItem, Spinner, SpinnerSize } from '@fluentui/react';
import { LayoutUtils } from '../LayoutUtils';
import { Utils } from '../Data/Utils';
import { Workspaces } from '../Data/Workspaces';
import { EventBus } from '../EventBus';
import { withRouter } from "react-router";



type MainNavState = {
	loading: boolean,
	lastLoadedTimestamp: number,
	currentWorkspaceUrl: string,
	selectedKey: string
};


export class MainNav extends Component<{}, MainNavState> {
	constructor(props) {
		super(props);
		let workspaceUrl = Utils.tryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspaceData), "url");
		let selectedKey: string = Utils.tryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo), ["contentItem", "url"]);
		this.state = { loading: true, lastLoadedTimestamp: LayoutUtils.WindowData.get("workspaceTreeTimestamp-" + encodeURI(workspaceUrl)), currentWorkspaceUrl: workspaceUrl, selectedKey: selectedKey };
	}

	componentDidMount() {
		MainNavController.prepData(this);
		this.navUpdateCall = this.onNavUpdate.bind(this);
		EventBus.on("navUpdate", this.navUpdateCall);
		this.fileStructChangedCall = this.fileStructChanged.bind(this);
		EventBus.on("fileStructChanged", this.fileStructChangedCall);
	}

	componentWillUnmount() {
		EventBus.remove("navUpdate", this.navUpdateCall);
		EventBus.remove("fileStructChanged", this.fileStructChangedCall);
	}

	shouldComponentUpdate(nextProps, nextState: MainNavState) {
		if (MainNavController.forceRefresh) return true;
		let currentWorkspaceUrl: string = Utils.tryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspaceData), "url");
		if ((currentWorkspaceUrl != this.state.currentWorkspaceUrl)
			|| (this.state.loading != nextState.loading)
			|| (this.state.lastLoadedTimestamp != LayoutUtils.WindowData.get("workspaceTreeTimestamp-" + encodeURI(currentWorkspaceUrl)))
			|| (this.state.selectedKey != nextState.selectedKey))
			return true;
		return false;
	}

	navUpdateCall = null;
	onNavUpdate() {
		let workspaceUrl = Utils.tryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspaceData), "url");
		let lastLoadedTimestamp = LayoutUtils.WindowData.get("workspaceTreeTimestamp-" + encodeURI(workspaceUrl));
		let selectedKey: string = Utils.tryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo), ["contentItem", "url"]);
		if ((workspaceUrl != this.state.currentWorkspaceUrl) || (lastLoadedTimestamp != this.state.lastLoadedTimestamp)) {
			MainNavController.hasLoaded = false;
			MainNavController.treeData = null;
			this.setState({ loading: true, selectedKey: selectedKey });
			MainNavController.loadData();
		}
		else if (selectedKey != this.state.selectedKey) {
			this.setState({ selectedKey: selectedKey });
		}
	}

	fileStructChangedCall = null;
	fileStructChanged() {
		MainNavController.forceRefresh = true;
		MainNavController.loadData();
	}


	render() {
		MainNavController.forceRefresh = false;
		return (
			<Pivot>
				<PivotItem headerText="Content">
					{MainNavController.getContent()}
				</PivotItem>
				<PivotItem headerText="Options">
					{MainNavController.getOptionsContent()}
				</PivotItem>
			</Pivot>
		);
	}


	static itemChildrenToLinks(items: Array<Workspaces.ContentItem>, currentUrl: string): Array<INavLink> {
		if (!Utils.arrayHasValues(items)) return null;
		let links: Array<INavLink> = [];
		for (let x = 0; x < items.length; x++) {
			let item = items[x];
			let link = this.itemToNavLink(item, currentUrl);
			if (Utils.arrayHasValues(item.children)) {
				link.links = this.itemChildrenToLinks(item.children, currentUrl);
				link.icon = null;
			}
			links.push(link);
		}
		return links;
	}

	static itemToNavLink(item: Workspaces.ContentItem, currentUrl: string): INavLink {
		if (item == null) return null;
		let currentUrlTrailed = Utils.padWithSlash(currentUrl, false, true);
		let itemUrlTrailed = Utils.padWithSlash(item.url, false, true);
		let isExpanded: boolean = ((item.url == currentUrl) || (currentUrlTrailed.startsWith(itemUrlTrailed)));

		let icon: string = (item.type == Workspaces.ContentItemType.Directory) ? "FolderFill" : "Page";
		if (item.type == Workspaces.ContentItemType.File) {
			let extension: string = Utils.lastStringPart(item.name, ".");
			if (extension?.length > 0) {
				switch (extension.toLowerCase()) {
					case "md": case "markdown": case "mdown": case "mkdn": case "mkd": case "mdwn": case "text": { icon = "MarkDownLanguage"; break; }
					case "txt": { icon = "TextDocument"; break; }
					case "js": case "json": { icon = "JavaScriptLanguage"; break; }
					case "jpg": case "jpeg": case "png": case "gif": case "bmp": case "tiff": case "tif": case "ico": case "svg": { icon = "Photo2"; break; }
				}
			}
		}

		return {
			name: item.name,
			url: "workspace" + item.reactLocalUrl,
			key: (item.url.endsWith("/")) ? item.url.slice(0, -1) : item.url,
			icon: icon,
			isExpanded: isExpanded
		};
	}
}


export const MainNavWithRouter = withRouter(MainNav);



module MainNavController {

	let instance: MainNav = null;
	export let treeData: Array<Workspaces.ContentItem> = null;
	export let forceRefresh: boolean = false;
	export let hasLoaded: boolean = false;

	export let workspace: Workspaces.Workspace = null;

	export function prepData(
		navInstance: MainNav
	): void {
		instance = navInstance;



		loadData();
	}


	export function getContent(): JSX.Element {
		if (hasLoaded != true) {
			return (<div className="loadingSpinner"><Spinner label="Loading..." labelPosition="right" size={SpinnerSize.large} /></div>);
		}

		let selectedKey = instance.state.selectedKey;
		if (selectedKey.endsWith("/")) selectedKey = selectedKey.slice(0, -1);

		let links: INavLink[] = MainNav.itemChildrenToLinks(MainNavController.treeData, selectedKey);
		if (links != null)
			links.reverse();
		else
			links = [];
		links.push({ name: "/", url: "workspace" + workspace.reactLocalUrl, key: "/", icon: "HomeSolid", isExpanded: false });
		if (links.length > 1) links.reverse();

		let navLinkGroups: INavLinkGroup[] = [
			{
				links: links
			}
		];
		return (<Nav groups={navLinkGroups} selectedKey={selectedKey} onLinkClick={onLinkClick} />);
	}

	export function getOptionsContent(): JSX.Element {
		if (hasLoaded != true) {
			return (<div className="loadingSpinner"><Spinner label="Loading..." labelPosition="right" size={SpinnerSize.large} /></div>);
		}

		let selectedKey = instance.state.selectedKey;
		if (selectedKey.endsWith("/")) selectedKey = selectedKey.slice(0, -1);
		let groups: INavLinkGroup[] = [];

		if (workspace?.storage?.hasGit == true) {
			groups.push({
				name: "Storage",
				links: [
					{ name: "Git repository", key: "_options/git", url: "workspace" + workspace?.reactLocalUrl + "?options=git", icon: "GitGraph" }
				]
			});

		}


		return (<Nav groups={groups} selectedKey={selectedKey} onLinkClick={onLinkClick} />);
	}


	export function onLinkClick(ev ?: React.MouseEvent < HTMLElement >, item ?: INavLink) {
		ev.preventDefault();
		Utils.tryGet(instance.props, "history").push(Utils.padWithSlash(item.url, true, false));
		EventBus.dispatch("navChange");
	}


	export async function loadData(): Promise<void> {
		hasLoaded = false;
		workspace = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspaceData);
		let workspaceUrl = workspace?.url;
		if ((workspaceUrl == null) || (workspaceUrl == "")) return;
		treeData = await Workspaces.loadTree(workspaceUrl);
		hasLoaded = true;
		instance.setState({ loading: false, currentWorkspaceUrl: workspaceUrl, lastLoadedTimestamp: LayoutUtils.WindowData.get("workspaceTreeTimestamp-" + encodeURI(workspaceUrl)) });
	}

}



