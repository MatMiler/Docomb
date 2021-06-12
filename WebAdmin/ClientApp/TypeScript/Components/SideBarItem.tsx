import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { LayoutUtils } from '../LayoutUtils';


type SideBarItemData = {
	name: string,
	url: string,
	initials: string,
	icon?: string,
	exactMatch?: boolean,
	itemKey: string
};

export class SideBarItem extends Component<SideBarItemData, SideBarItemData> {
	constructor(props: SideBarItemData) {
		super(props);
		this.state = { name: props.name, url: props.url, initials: props.initials, icon: props.icon, exactMatch: props.exactMatch, itemKey: props.itemKey };
	}

	render() {
		let classNames = "sideBarItem";
		let iconContent = <span className="icon">{this.state.initials}</span>;
		if (this.state.icon) {
			iconContent = <span className="icon"><FontIcon iconName={this.state.icon} /></span>;
		}
		if (LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem) == this.state.itemKey)
			classNames += " selected";
		return (
			<div className={classNames} data-key={this.state.itemKey}>
				<Link to={this.state.url}>
					{iconContent}
					<span className="name">{this.state.name}</span>
				</Link>
			</div>
		);
	}
}
