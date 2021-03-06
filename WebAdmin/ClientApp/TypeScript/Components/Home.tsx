import React, { Component } from 'react';
import { EventBus } from '../EventBus';
import { LayoutUtils } from '../LayoutUtils';
import { Layout } from './Layout';
import { LibraryIcon } from '@fluentui/react-icons-mdl2';

export class Home extends Component {
	componentDidMount() {
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, LayoutUtils.NavBar.ItemKey.Home);
		EventBus.dispatch("navUpdate");
	}

	render() {
		return (
			<Layout mainNavType={null}>
				<div className="adminHome emptyPage">
					<div className="watermark"><LibraryIcon /></div>
				</div>
			</Layout>
		);
	}
}

