import React, { Component } from 'react';
import { SideBarItem } from './SideBarItem';
import { Workspace, Workspaces } from "../Data/Workspaces";


type SideBarState = {
	workspaces: Array<Workspace>,
	loading: boolean
};

export class SideBarNav extends Component<{}, SideBarState> {

	constructor(props) {
		super(props);
		this.state = { workspaces: [], loading: true };
	}

	componentDidMount() {
		this.populateWorkspaces();
	}

	static renderWorkspaces(workspaces: Array<Workspace>) {
		let content = workspaces.map(item =>
			<SideBarItem key={item.url} name={item.name} url={item.localUrl} initials={item.initials} />
		);
		return (content);
	}


	render() {
		let contents = this.state.loading
			? <div></div>
			: SideBarNav.renderWorkspaces(this.state.workspaces);

		return (
			<div className="sideBar">
				<div className="workspaces">{contents}</div>
				<div className="system">
					<SideBarItem name="Settings" url="" initials="S" icon="Settings" />
				</div>
			</div>
		);
	}

	async populateWorkspaces() {
		let data: Array<Workspace> = await Workspaces.load();
		this.setState({ workspaces: data, loading: false });
	}

}
