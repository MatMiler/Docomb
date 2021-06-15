import { FontIcon, Spinner, SpinnerSize } from '@fluentui/react';
import React, { FC, ReactElement, useEffect, useState } from 'react';
import { Utils } from '../../Data/Utils';
import { Workspaces } from '../../Data/Workspaces';
import { LayoutUtils } from '../../LayoutUtils';
import PageBreadcrumbs from './PageBreadcrumbs';
import $ from 'jquery';


const ContentFileInfo: FC<{}> = (): ReactElement => {
	const [loadedUrl, setLoadedUrl] = useState(null);

	function onDataChange() {
		if (loadedUrl != ContentFileInfoController.fileDetails?.reactLocalUrl)
			setLoadedUrl(ContentFileInfoController.fileDetails?.reactLocalUrl);
	}

	useEffect(() => {
		ContentFileInfoController.callbackOnData = onDataChange;
		ContentFileInfoController.loadData();
		return () => { ContentFileInfoController.callbackOnData = null; };
	});

	return (
		<div className="pageGrid">
			<div className="pageTitle"><PageBreadcrumbs /></div>
			{ContentFileInfoController.getToolbar()}
			{/*<div className="pageCommands">command bar</div>*/}
			<div className="pageContent">
				{ContentFileInfoController.getContentPanel()}
				{/*Content file; is loaded: {loadedUrl}; {ContentFileInfoController.fileDetails?.title}*/}
			</div>
		</div>
	);
};

export default ContentFileInfo;




module ContentFileInfoController {
	export let callbackOnData: () => void = null;

	let pageInfo: Workspaces.WorkspacePageInfo = null;
	export let fileDetails: Workspaces.FileDetails = null;
	export let isLoaded: boolean = false;

	export async function loadData(): Promise<void> {
		let callback = callbackOnData;
		let newPageInfo: Workspaces.WorkspacePageInfo = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo);
		if (newPageInfo?.contentItem?.reactLocalUrl != pageInfo?.contentItem?.reactLocalUrl) {
			isLoaded = false;
		} else if (isLoaded) {
			return;
		}

		pageInfo = newPageInfo;
		fileDetails = await Workspaces.loadFileDetails(pageInfo.contentItem.reactLocalUrl);

		isLoaded = true;

		if (callback != null) callback();
	}

	function isReady(): boolean {
		return (isLoaded) && (Utils.TryGetString(LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo), ["contentItem", "reactLocalUrl"]) == pageInfo?.contentItem?.reactLocalUrl);
	}

	export function getToolbar(): JSX.Element {
		if (!isReady())
			return null;
		return null;
	}

	export function getContentPanel(): JSX.Element {
		if (!isReady())
			return (<div className="loadingSpinner"><Spinner label="Loading..." labelPosition="right" size={SpinnerSize.large} /></div>);


		switch (fileDetails?.type) {
			case Workspaces.FileType.Markdown: {
				return (
					<div className="contentFileDetails">
						<div className="articleContent" dangerouslySetInnerHTML={{ __html: fixLocalLinksInHtml(fileDetails.contentHtml) }} />
						{getFileMetaDataPanel()}
					</div>
					);
			}
		}

		return null;
	}


	export function getFileMetaDataPanel(): JSX.Element {
		if (fileDetails == null) return null;
		let items: JSX.Element[] = [];

		if (Utils.TrimString(fileDetails.title, null) != null) items.push(<div className="item" key="metaTitle"><b>Title:</b> <span className="value">{fileDetails.title}</span></div>);
		if (Utils.TrimString(fileDetails.url, null) != null) items.push(<div className="item" key="metaUrl"><b>File:</b> <span className="value">{fileDetails.url}</span></div>);
		if (Utils.TrimString(fileDetails.fileSizeDesc, null) != null) items.push(<div className="item" key="metaSize"><b>File size:</b> <span className="value">{fileDetails.fileSizeDesc}</span></div>);


		if (items.length > 0)
			return (
				<div className="metaInfo">
					<h2><FontIcon iconName="Info" /> Information</h2>
					{items}
				</div>
				);

		return null;
	}



	export function fixLocalLinksInHtml(html: string): string {
		try {
			let container: JQuery<HTMLElement> = $("<div />").html(html);
			let readerBasePath: string = Utils.TryGetString(window, "readerBasePath");
			if (!readerBasePath.endsWith("/")) readerBasePath += "/";
			readerBasePath += pageInfo?.workspace?.url;
			if (!readerBasePath.endsWith("/")) readerBasePath += "/";
			container.find("a").each((index: number, element: HTMLAnchorElement) => {
				let a = $(element);
				a.attr("target", "_blank");
				let href = a.attr("href");
				if (Utils.TrimString(href, null) != null) {
					let slashPos = href.indexOf("/");
					if (slashPos == 0) return;
					let hashPos = href.indexOf("#");
					let doubleSlashPos = href.indexOf("//");
					let paramPos = href.indexOf("?");
					if (hashPos < 0) hashPos = href.length;
					if (doubleSlashPos < 0) doubleSlashPos = href.length;
					if (paramPos < 0) paramPos = href.length;
					if ((doubleSlashPos >= hashPos) && (doubleSlashPos >= paramPos)) {
						href = readerBasePath + href;
						a.attr("href", href);
					}
				}
			});
			html = container.html();
		}
		catch (e) {}


		return html;
	}



}



