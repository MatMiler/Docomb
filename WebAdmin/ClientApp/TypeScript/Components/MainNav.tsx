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

	instanceData: { treeData: Array<Workspaces.ContentItem>, forceRefresh: boolean } = {
		treeData: null,
		forceRefresh: false
	};

	componentDidMount() {
		this.populateContent();
		this.navUpdateCall = this.onNavUpdate.bind(this);
		EventBus.on("navUpdate", this.navUpdateCall);
		this.fileStructChangedCall = this.fileStructChanged.bind(this);
		EventBus.on("fileStructChanged", this.fileStructChangedCall);
	}

	componentWillUnmount() {
		EventBus.remove("navUpdate", this.navUpdateCall);
	}

	shouldComponentUpdate(nextProps, nextState: MainNavState) {
		if (this.instanceData.forceRefresh) return true;
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
			this.instanceData.treeData = null;
			this.setState({ loading: true, selectedKey: selectedKey });
			this.populateContent();
		}
		else if (selectedKey != this.state.selectedKey) {
			this.setState({ selectedKey: selectedKey });
		}
	}

	fileStructChangedCall = null;
	fileStructChanged() {
		this.instanceData.forceRefresh = true;
		this.populateContent();
	}


	render() {
		let content: JSX.Element = null;
		if (this.state.loading) {
			content = <div className="loadingSpinner"><Spinner label="Loading..." labelPosition="right" size={SpinnerSize.large} /></div>;
		} else {
			let selectedKey = this.state.selectedKey;
			if (selectedKey.endsWith("/")) selectedKey = selectedKey.slice(0, -1);
			let navLinkGroups: INavLinkGroup[] = [
				{
					links: MainNav.itemChildrenToLinks(this.instanceData.treeData, selectedKey)
				}
			];
			content = <Nav groups={navLinkGroups} selectedKey={selectedKey} onLinkClick={this.onLinkClick.bind(this)} />;
		}



		this.instanceData.forceRefresh = false;
		return (
			<Pivot>
				<PivotItem headerText="Content" >
					{content}
				</PivotItem>
				<PivotItem headerText="Options" hidden={true} >
					Workspace options
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
		let currentUrlTrailed = currentUrl + ((currentUrl.endsWith("/")) ? "" : "/");
		let itemUrlTrailed = item.url + ((item.url.endsWith("/")) ? "" : "/");
		let isExpanded: boolean = ((item.url == currentUrl) || (currentUrlTrailed.startsWith(itemUrlTrailed)));
		return {
			name: item.name,
			url: "workspace" + item.reactLocalUrl,
			key: (item.url.endsWith("/")) ? item.url.slice(0, -1) : item.url,
			icon: (item.type == Workspaces.ContentItemType.Directory) ? "FolderHorizontal" : "Page",
			isExpanded: isExpanded
		};
	}

	onLinkClick(ev?: React.MouseEvent<HTMLElement>, item?: INavLink) {
		ev.preventDefault();
		Utils.tryGet(this.props, "history").push("/" + item.url);
		EventBus.dispatch("navChange");
	}


	async populateContent() {
		let workspaceUrl = Utils.tryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspaceData), "url");
		if ((workspaceUrl == null) || (workspaceUrl == "")) return;
		let data: Array<Workspaces.ContentItem> = await Workspaces.loadTree(workspaceUrl);
		this.instanceData.treeData = data;
		this.setState({ loading: false, currentWorkspaceUrl: workspaceUrl, lastLoadedTimestamp: LayoutUtils.WindowData.get("workspaceTreeTimestamp-" + encodeURI(workspaceUrl)) });
	}

}


export const MainNavWithRouter = withRouter(MainNav);

