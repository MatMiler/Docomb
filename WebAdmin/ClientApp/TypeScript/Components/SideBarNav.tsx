import React, { Component } from 'react';
import { SideBarItem } from './SideBarItem';


type SideBarState = {
	workspaces: {}[],
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

	static renderWorkspaces(workspaces) {
		let content = workspaces.map(item =>
			<SideBarItem key={item.url} name={item.name} url={item.url} initials={item.initials} />
		);
		return (content);
	}


	render() {
		let contents = this.state.loading
			? <p><em>Loading...</em></p>
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
		let response = await fetch("api/general/workspaces");
		let data = await response.json();
		this.setState({ workspaces: data, loading: false });
	}

}
