import React, { Component, useEffect, useState } from 'react';
import { Layout } from './Layout';
import { Utils } from '../Data/Utils';
import { Workspaces } from '../Data/Workspaces';
import { LayoutUtils } from '../LayoutUtils';
import { EventBus } from '../EventBus';



type WorkspaceHomeState = {
	pageInfo: Workspaces.WorkspacePageInfo,
	loading: boolean
};

export class WorkspaceHome extends Component<void, WorkspaceHomeState> {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspaceData, null);
		this.populateInfo();
		this.navCall = this.onNav.bind(this);
		EventBus.on("navChange", this.navCall);
	}

	componentWillUnmount() {
		EventBus.remove("navChange", this.navCall);
	}

	componentDidUpdate(prevProps: any, prevState: any) {
		let prevLocation = Utils.TryGetString(prevProps, ["location", "pathname"]);
		let currentLocation = Utils.TryGetString(this.props, ["location", "pathname"]);
		if (prevLocation != currentLocation) {
			LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspaceData, null);
			this.populateInfo();
		}
	}

	navCall = null;
	onNav() {
	}


	render() {
		return (
			<Layout showMainNav={true}>
				<div className="">
					Workspace home page ({this.state?.pageInfo?.workspace?.name}, {Utils.TryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.ContentItemData), "name")})
				</div>
			</Layout>
		);
	}

	async populateInfo() {
		let data: Workspaces.WorkspacePageInfo = await Workspaces.loadPageInfo(Utils.TryGet(this.props, ["match", "params", "itemPath"]));
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, data?.workspace?.url);
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspaceData, data?.workspace);
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.ContentItemData, data?.contentItem);
		EventBus.dispatch("navUpdate");
		this.setState({ pageInfo: data, loading: false });
	}

}

