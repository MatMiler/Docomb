import { FontIcon } from '@fluentui/react';
import React, { Component } from 'react';
import { EventBus } from '../EventBus';
import { LayoutUtils } from '../LayoutUtils';
import { Layout } from './Layout';

export class Home extends Component {
	componentDidMount() {
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, LayoutUtils.NavBar.ItemKey.Home);
		EventBus.dispatch("navUpdate");
	}

	render() {
		return (
			<Layout showMainNav={false}>
				<div className="adminHome emptyPage">
					<div className="watermark"><FontIcon iconName="Library" /></div>
				</div>
			</Layout>
		);
	}
}

