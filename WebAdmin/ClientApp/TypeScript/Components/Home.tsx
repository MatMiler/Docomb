import React, { Component } from 'react';
import { EventBus } from '../EventBus';
import { LayoutUtils } from '../LayoutUtils';
import { Layout } from './Layout';

export class Home extends Component {
	render() {
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, LayoutUtils.NavBar.ItemKey.Home);
		EventBus.dispatch("navUpdate");
		return (
			<Layout showMainNav={false}>
				<div>
					Docomb administration home page
				</div>
			</Layout>
		);
	}
}

