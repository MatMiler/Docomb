import React, { Component } from 'react';
import { EventBus } from '../EventBus';
import { LayoutUtils } from '../LayoutUtils';

export class NotFound extends Component {
	componentDidMount() {
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, LayoutUtils.NavBar.ItemKey.Home);
		EventBus.dispatch("navUpdate");
	}

	render() {
		return (
			<div className="errorPage">
				<div className="codeWatermark">404</div>
				<div className="message">Not found</div>
			</div>
		);
	}
}

