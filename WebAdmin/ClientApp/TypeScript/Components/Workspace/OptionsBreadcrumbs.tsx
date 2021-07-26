import { Breadcrumb, IBreadcrumbItem } from '@fluentui/react';
import React, { FC, ReactElement } from 'react';
import { useHistory } from "react-router-dom";
import { Utils } from '../../Data/Utils';
import { Workspaces } from '../../Data/Workspaces';
import { EventBus } from '../../EventBus';
import { LayoutUtils } from '../../LayoutUtils';


export interface IOptionsBreadcrumbsProps {
	path: IOptionsBreadcrumbsPathItem[]
}

export interface IOptionsBreadcrumbsPathItem {
	name: string,
	url: string
}

const OptionsBreadcrumbs: FC<IOptionsBreadcrumbsProps> = ({ path }: IOptionsBreadcrumbsProps): ReactElement => {

	const history = useHistory();
	function onClick(ev: React.MouseEvent<HTMLElement>, item: IBreadcrumbItem) {
		ev.preventDefault();
		history.push(Utils.padWithSlash(item.href, true, false));
		EventBus.dispatch("navChange");
	}

	let workspace: Workspaces.Workspace = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspaceData);
	let breadcrumbs: IBreadcrumbItem[] = [];
	path = [{ name: workspace.name, url: null }].concat(path);
	if (Utils.arrayHasValues(path)) {
		for (let x = 0; x < path.length; x++) {
			let item = path[x];
			let isCurrent: boolean = (x == path.length - 1);
			let crumb: IBreadcrumbItem = {
				text: item.name,
				key: item.url,
				isCurrentItem: isCurrent
			};
			if (!isCurrent) {
				crumb.href = "workspace" + workspace?.reactLocalUrl + Utils.parseString(item.url, "");
				crumb.onClick = onClick;
			}
			breadcrumbs.push(crumb);
		}
	}

	return (
		<div>
			<Breadcrumb items={breadcrumbs} overflowAriaLabel="More breadcrumbs" />
		</div>
	);
};

export default OptionsBreadcrumbs;
