import React, { Component, useEffect, useState } from 'react';
import { Layout } from './Layout';
import { Utils } from '../Data/Utils';
import { Workspaces } from '../Data/Workspaces';
import { LayoutUtils } from '../LayoutUtils';
import { EventBus } from '../EventBus';
import Home from './Workspace/Home';
import ContentDirectory from './Workspace/ContentDirectory';
import ContentFileInfo from './Workspace/ContentFileInfo';
import EditTextFile from './Workspace/EditTextFile';



type WorkspaceWrapperState = {
	pageInfo: Workspaces.WorkspacePageInfo,
	loading: boolean
};

export class WorkspaceWrapper extends Component<void, WorkspaceWrapperState> {
	constructor(props) {
		super(props);
		this.state = { pageInfo: null, loading: true };
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
		let prevSearch = Utils.TryGetString(prevProps, ["location", "search"]);
		let currentSearch = Utils.TryGetString(this.props, ["location", "search"]);
		if ((prevLocation != currentLocation) || (prevSearch != currentSearch)) {
			LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspaceData, null);
			this.populateInfo();
		}
	}

	navCall = null;
	onNav() {
	}


	render() {
		let content: JSX.Element = null;
		if (this.state.loading == false) {
			if (Utils.TrimString(this.state.pageInfo.contentItem?.url, null) == null) {
				content = <Home />;
			} else if (this.state.pageInfo.contentItem.type == Workspaces.ContentItemType.Directory) {
				content = <ContentDirectory />;
			} else {
				if (this.state.pageInfo.action == Workspaces.ContentItemAction.Edit) {
					switch (this.state.pageInfo?.details?.type) {
						case Workspaces.FileType.Markdown:
						case Workspaces.FileType.Html:
						case Workspaces.FileType.PlainText:
							{
								content = <EditTextFile />;
								break;
							}
						default:
							{
								content = <ContentFileInfo />;
								break;
							}
					}
				}
				else {
					content = <ContentFileInfo />;
				}

			}
		}

		return (
			<Layout showMainNav={true}>
				{content}
			</Layout>
		);
	}

	async populateInfo() {
		let data: Workspaces.WorkspacePageInfo = await Workspaces.loadPageInfo(Utils.TryGetString(this.props, ["match", "params", "itemPath"]), Utils.TryGetString(this.props, ["location", "search"]));
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, data?.workspace?.url);
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspaceData, data?.workspace);
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo, data);
		this.setState({ pageInfo: data, loading: false });
		EventBus.dispatch("navUpdate");
	}

}



