import React, { Component } from 'react';
import { LayoutUtils } from '../LayoutUtils';
import { Layout } from './Layout';

export class Settings extends Component {
	render() {
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, LayoutUtils.NavBar.ItemKey.Settings);
		return (
			<Layout showMainNav={false}>
				<div>
					Settings
				</div>
			</Layout>
		);
	}
}

