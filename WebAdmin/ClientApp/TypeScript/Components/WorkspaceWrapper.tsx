import React, { Component, useEffect, useState } from 'react';
import { Layout } from './Layout';
import { Utils } from '../Data/Utils';
import { Workspaces } from '../Data/Workspaces';
import { LayoutUtils } from '../LayoutUtils';
import { EventBus } from '../EventBus';
import ContentDirectory from './Workspace/ContentDirectory';
import ContentFileInfo from './Workspace/ContentFileInfo';
import EditTextFile from './Workspace/EditTextFile';
import { NotFound } from './NotFound';



type WorkspaceWrapperState = {
	hash: string
};

export class WorkspaceWrapper extends Component<void, WorkspaceWrapperState> {
	constructor(props) {
		super(props);
		this.state = { hash: null };
	}

	componentDidMount() {
		WorkspaceWrapperController.prep(this);
		this.onLocationChangeCall = this.onLocationChange.bind(this);
		EventBus.on(WorkspaceWrapperController.locationChangeEventName, this.onLocationChangeCall);
	}

	componentWillUnmount() {
		EventBus.remove(WorkspaceWrapperController.locationChangeEventName, this.onLocationChangeCall);
	}

	componentDidUpdate(prevProps: any, prevState: any) {
		WorkspaceWrapperController.onComponentUpdate();
	}

	onLocationChangeCall = null;
	onLocationChange(): void {
		this.setState({ hash: WorkspaceWrapperController.stateHash });
	}

	render() {
		return (
			<Layout showMainNav={true}>
				{WorkspaceWrapperController.getContent()}
			</Layout>
		);
	}

}


module WorkspaceWrapperController {

	export const locationChangeEventName = "workspaceWrapper-locationChange";

	export let requestedPath: string = null;
	export let requestedQuery: string = null;

	export let isLoading: boolean = true;
	export let selectedSideBarItem: string = null;
	export let workspace: Workspaces.Workspace = null;
	export let pageInfo: Workspaces.WorkspacePageInfo = null;
	export let instance: WorkspaceWrapper = null;

	export let stateHash: string = null;

	export function prep(
		componentInstance: WorkspaceWrapper
	): void {
		instance = componentInstance;
		instance["test"] = Utils.tryGet(instance, "test", Math.random());

		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, null);
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspaceData, null);
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo, null);


		loadData();
	}

	export async function loadData(): Promise<void> {
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspaceData, null);
		requestedPath = getInstancePath();
		requestedQuery = getInstanceQuery();
		isLoading = true;
		let data: Workspaces.WorkspacePageInfo = await Workspaces.loadPageInfo(requestedPath, requestedQuery);

		pageInfo = data;
		workspace = data?.workspace;
		selectedSideBarItem = workspace?.url;

		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, selectedSideBarItem);
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspaceData, workspace);
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo, pageInfo);
		isLoading = false;

		stateHash = getStateHash();
		EventBus.dispatch(WorkspaceWrapperController.locationChangeEventName);
		EventBus.dispatch("navUpdate");
	}

	export function getStateHash(path?: string, query?: string): string {
		if (path === undefined) path = requestedPath;
		if (query === undefined) query = requestedQuery;
		return path + "|" + query;
	}

	export function getInstancePath(): string { return Utils.tryGetString(instance, ["props", "match", "params", "itemPath"]); }
	export function getInstanceQuery(): string { return Utils.tryGetString(instance, ["props", "location", "search"]); }


	export function onComponentUpdate(): void {
		let newHash = getStateHash(getInstancePath(), getInstanceQuery());
		if (newHash != stateHash) {
			loadData();
		}
	}


	export function getContent(): JSX.Element {
		if (isLoading) return null;

		if (pageInfo?.contentItem?.type == Workspaces.ContentItemType.Directory) {
			return (<ContentDirectory />);
		}

		if (pageInfo?.contentItem?.type == Workspaces.ContentItemType.File) {

			if (pageInfo.action == Workspaces.ContentItemAction.Edit) {
				switch (WorkspaceWrapperController.pageInfo?.details?.type) {
					case Workspaces.FileType.Markdown:
					case Workspaces.FileType.Html:
					case Workspaces.FileType.PlainText:
						{
							return (<EditTextFile />);
						}
				}
			}

			return (<ContentFileInfo />);
		}


		return (<NotFound />);
	}

}


