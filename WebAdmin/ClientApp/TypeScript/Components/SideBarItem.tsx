import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FontIcon } from '@fluentui/react/lib/Icon';


type SideBarItemData = {
	name: string,
	url: string,
	initials: string,
	icon?: string
};

export class SideBarItem extends Component<SideBarItemData, SideBarItemData> {
	constructor(props) {
		super(props);
		this.state = { name: props.name, url: props.url, initials: props.initials, icon: props.icon };
	}

	render() {
		let classNames = "sideBarItem";
		let iconContent = <span className="icon">{this.state.initials}</span>;
		if (this.state.icon) {
			iconContent = <span className="icon"><FontIcon iconName={this.state.icon} /></span>;
		}
		return (
			<div className={classNames}>
				<Link to={this.state.url}>
					{iconContent}
					<span className="name">{this.state.name}</span>
				</Link>
			</div>
		);
	}
}
