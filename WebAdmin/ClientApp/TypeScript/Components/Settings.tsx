import React, { Component } from 'react';
import { EventBus } from '../EventBus';
import { LayoutUtils } from '../LayoutUtils';
import { Layout } from './Layout';

export class Settings extends Component {
	render() {
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, LayoutUtils.NavBar.ItemKey.Settings);
		EventBus.dispatch("navUpdate");
		return (
			<Layout showMainNav={false}>
				<div>
					Settings
				</div>
			</Layout>
		);
	}
}

