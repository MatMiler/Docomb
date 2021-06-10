import React, { Component } from 'react';
import { ThemeProvider, PartialTheme } from '@fluentui/react/lib/Theme';
import { SideBarNav } from './SideBarNav';
import { MainNav } from './MainNav';

import { darkTheme, lightTheme } from '../Themes';


export class Layout extends Component {
	render() {
		let isDark = false;
		try {
			isDark = window.matchMedia("(prefers-color-scheme: dark)").matches || isDark;
			if (document.documentElement.classList.contains("light")) isDark = false;
			if (document.documentElement.classList.contains("dark")) isDark = true;
		}
		catch (e) { }
		console.log("Is dark: " + isDark);
		return (
			<ThemeProvider theme={isDark ? darkTheme : lightTheme}>
				<div className="adminRoot mainNavGrid">
					<div className="sideBarNav">
						<SideBarNav />
					</div>
					<div className="mainNav">
						<MainNav />
					</div>
					<div className="mainNavGridContent">
						{this.props.children}
					</div>
				</div>
			</ThemeProvider>
		);
	}
}
