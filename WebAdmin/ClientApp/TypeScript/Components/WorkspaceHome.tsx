import React, { Component, useEffect, useState } from 'react';
import { Layout } from './Layout';
import { Utils } from '../Data/Utils';
import { Workspaces } from '../Data/Workspaces';
import { LayoutUtils } from '../LayoutUtils';


type WorkspaceHomeState = {
	pageInfo: Workspaces.WorkspacePageInfo,
	loading: boolean
};

export class WorkspaceHome extends Component<void, WorkspaceHomeState> {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.populateInfo();
	}

	componentDidUpdate(prevProps: any, prevState: any) {
		let prevLocation = Utils.TryGetString(prevProps, ["location", "pathname"]);
		let currentLocation = Utils.TryGetString(this.props, ["location", "pathname"]);
		if (prevLocation != currentLocation) this.populateInfo();
	}


	render() {
		return (
			<Layout showMainNav={true}>
				<div className="">
					Workspace home page ({this.state?.pageInfo?.workspace?.name})
				</div>
			</Layout>
		);
	}

	async populateInfo() {
		let data: Workspaces.WorkspacePageInfo = await Workspaces.loadPageInfo(Utils.TryGet(this.props, ["match", "params", "itemPath"]));
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, data?.workspace?.url);
		this.setState({ pageInfo: data, loading: false });
	}

}

