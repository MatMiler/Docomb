import React, { Component } from 'react';
import { SideBarItem } from './SideBarItem';
import { Workspaces } from "../Data/Workspaces";
import { LayoutUtils } from '../LayoutUtils';


type SideBarState = {
	workspaces: Array<Workspaces.Workspace>,
	loading: boolean
};

export class SideBarNav extends Component<{}, SideBarState> {

	constructor(props) {
		super(props);
		this.state = { workspaces: [], loading: true };
		//LayoutUtils.NavBar.updateNavBar = LayoutUtils.NavBar.updateNavBar.bind(this)
	}

	componentDidMount() {
		this.populateWorkspaces();
	}

	static renderWorkspaces(workspaces: Array<Workspaces.Workspace>) {
		let content = workspaces.map(item =>
			<SideBarItem key={item.url} name={item.name} url={"/workspace" + item.localUrl} initials={item.initials} exactMatch={false} itemKey={item.url} />
		);
		return (content);
	}


	render() {
		let contents = this.state.loading
			? <div></div>
			: SideBarNav.renderWorkspaces(this.state.workspaces);

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
		this.setState({ workspaces: data, loading: false });
	}

}
