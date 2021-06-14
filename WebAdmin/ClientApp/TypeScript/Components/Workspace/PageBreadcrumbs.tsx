import { Breadcrumb, IBreadcrumbItem } from '@fluentui/react';
import React, { FC, ReactElement } from 'react';
import { useHistory } from "react-router-dom";
import { Utils } from '../../Data/Utils';
import { Workspaces } from '../../Data/Workspaces';
import { EventBus } from '../../EventBus';
import { LayoutUtils } from '../../LayoutUtils';


const PageBreadcrumbs: FC<{}> = (): ReactElement => {

	let pageInfo: Workspaces.WorkspacePageInfo = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo);

	const history = useHistory();
	function onClick(ev: React.MouseEvent<HTMLElement>, item: IBreadcrumbItem) {
		ev.preventDefault();
		history.push("/" + item.href);
		EventBus.dispatch("navChange");
	}

	let breadcrumbs: IBreadcrumbItem[] = [];
	if (Utils.ArrayHasValues(pageInfo?.breadcrumbs)) {
		for (let x = 0; x < pageInfo.breadcrumbs.length; x++) {
			let item = pageInfo.breadcrumbs[x];
			let isCurrent: boolean = (x == pageInfo.breadcrumbs.length - 1);
			let crumb: IBreadcrumbItem = {
				text: item.name,
				key: item.url,
				href: isCurrent ? null : "workspace" + item.reactLocalUrl,
				onClick: onClick,
				isCurrentItem: isCurrent
			};
			breadcrumbs.push(crumb);
		}
	}

	return (
		<div>
			<Breadcrumb items={breadcrumbs} overflowAriaLabel="More breadcrumbs" />
		</div>
	);
};

export default PageBreadcrumbs;
