import React, { Component } from 'react';
import { ThemeProvider, PartialTheme } from '@fluentui/react/lib/Theme';
import { SideBarNav } from './SideBarNav';
import { MainNav, MainNavWithRouter } from './MainNav';

import { darkTheme, lightTheme } from '../Themes';
import SettingsNav from './Settings/SettingsNav';


type LayoutData = {
	mainNavType: string
};


export class Layout extends Component<LayoutData, LayoutData> {
	constructor(props: LayoutData) {
		super(props);
		this.state = { mainNavType: props.mainNavType };
	}

	render() {
		let isDark = false;
		try {
			isDark = window.matchMedia("(prefers-color-scheme: dark)").matches || isDark;
			if (document.documentElement.classList.contains("light")) isDark = false;
			if (document.documentElement.classList.contains("dark")) isDark = true;
		}
		catch (e) { }

		let siteBarNavClassName = "sideBarNav";

		let mainNav: JSX.Element = null;
		switch (this.state.mainNavType) {
			case "workspace": {
				mainNav = (<div className="mainNav">
					<MainNavWithRouter />
				</div>);
				siteBarNavClassName += " collapsed";
				break;
			}
			case "settings": {
				mainNav = (<div className="mainNav">
					<SettingsNav />
				</div>);
				siteBarNavClassName += " collapsed";
				break;
			}
			default: {
				siteBarNavClassName += " expanded";
				break;
			}
		}

		return (
			<ThemeProvider theme={isDark ? darkTheme : lightTheme}>
				<div className="adminRoot mainNavGrid">
					<div className={siteBarNavClassName}>
						<SideBarNav />
					</div>
					{mainNav}
					<div className="mainNavGridContent">
						{this.props.children}
					</div>
				</div>
			</ThemeProvider>
		);
	}
}
