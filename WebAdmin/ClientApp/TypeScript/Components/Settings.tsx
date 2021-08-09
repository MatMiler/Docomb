import React, { Component } from 'react';
import { EventBus } from '../EventBus';
import { LayoutUtils } from '../LayoutUtils';
import { Layout } from './Layout';
import { SettingsIcon } from '@fluentui/react-icons-mdl2';

export class Settings extends Component {
	componentDidMount() {
		LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, LayoutUtils.NavBar.ItemKey.Settings);
		EventBus.dispatch("navUpdate");
	}

	render() {
		return (
			<Layout mainNavType="settings">
				<div className="adminHome emptyPage">
					<div className="watermark"><SettingsIcon /></div>
				</div>
			</Layout>
		);
	}
}

