import { Breadcrumb, IBreadcrumbItem } from '@fluentui/react';
import React, { FC, ReactElement } from 'react';
import { useHistory } from "react-router-dom";
import { Utils } from '../../Data/Utils';
import { EventBus } from '../../EventBus';


export interface ISettingsBreadrumbsProps {
	path: ISettingsBreadrumbsPathItem[]
}

export interface ISettingsBreadrumbsPathItem {
	name: string,
	url: string
}

const SettingsBreadcrumbs: FC<ISettingsBreadrumbsProps> = ({ path }: ISettingsBreadrumbsProps): ReactElement => {

	const history = useHistory();
	function onClick(ev: React.MouseEvent<HTMLElement>, item: IBreadcrumbItem) {
		ev.preventDefault();
		history.push(Utils.padWithSlash(item.href, true, false));
		EventBus.dispatch("navChange");
	}

	let breadcrumbs: IBreadcrumbItem[] = [];
	path = [{ name: "Settings", url: "" }].concat(path);
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
				crumb.href = "settings" + item.url;
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

export default SettingsBreadcrumbs;
