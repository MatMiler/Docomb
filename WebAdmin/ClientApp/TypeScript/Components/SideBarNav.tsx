import React, { Component } from 'react';
import { SideBarItem } from './SideBarItem';
import { Workspaces } from "../Data/Workspaces";
import { LayoutUtils } from '../LayoutUtils';
import { EventBus } from '../EventBus';


type SideBarState = {
	workspaces: Array<Workspaces.Workspace>,
	loading: boolean,
	lastSelection: string
};

export class SideBarNav extends Component<{}, SideBarState> {
	private instanceData = { isMounted: false };

	constructor(props) {
		super(props);
		this.instanceData.isMounted = false;
		let lastSelection = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem);
		this.state = { workspaces: [], loading: true, lastSelection: lastSelection };
	}

	componentDidMount() {
		this.instanceData.isMounted = true;
		this.populateWorkspaces();
		this.navUpdateCall = this.onNavUpdate.bind(this);
		EventBus.on("navUpdate", this.navUpdateCall);
	}

	componentWillUnmount() {
		this.instanceData.isMounted = false;
		EventBus.remove("navUpdate", this.navUpdateCall);
	}

	renderWorkspaces(workspaces: Array<Workspaces.Workspace>) {
		let content = workspaces.map(item =>
			<SideBarItem key={item.url} name={item.name} url={"/workspace" + item.localUrl} initials={item.initials} exactMatch={false} itemKey={item.url} />
		);
		return (content);
	}

	shouldComponentUpdate(nextProps, nextState: SideBarState) {
		let currentSelection: string = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem);
		return ((currentSelection != this.state.lastSelection) || (this.state.loading != nextState.loading));
	}

	navUpdateCall = null;
	onNavUpdate() {
		if (this.instanceData.isMounted != true) return;
		let lastSelection: string = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem);
		this.setState({ lastSelection: lastSelection });
	}


	render() {
		let contents = (this.state.loading) ? null : this.renderWorkspaces(this.state.workspaces);

		return (
			<div className="sideBar">
				<div className="workspaces">
					<SideBarItem name="Home" url="/" initials="H" icon="Home" itemKey={LayoutUtils.NavBar.ItemKey.Home} />
					{contents}
				</div>
				<div className="system">
					<SideBarItem name="Settings" url="/settings" initials="S" icon="Settings" itemKey={LayoutUtils.NavBar.ItemKey.Settings} />
				</div>
			</div>
		);
	}

	async populateWorkspaces() {
		let data: Array<Workspaces.Workspace> = await Workspaces.loadWorkspaceList();
		if (this.instanceData.isMounted)
			this.setState({ workspaces: data, loading: false });
	}

}
