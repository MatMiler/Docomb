import React, { Component } from 'react';
import { ThemeProvider, PartialTheme } from '@fluentui/react/lib/Theme';
import { SideBarNav } from './SideBarNav';
import { MainNav } from './MainNav';

import { darkTheme, lightTheme } from '../Themes';


type LayoutData = {
	showMainNav: boolean
};


export class Layout extends Component<LayoutData, LayoutData> {
	constructor(props: LayoutData) {
		super(props);
		this.state = { showMainNav: props.showMainNav };
	}

	render() {
		let isDark = false;
		try {
			isDark = window.matchMedia("(prefers-color-scheme: dark)").matches || isDark;
			if (document.documentElement.classList.contains("light")) isDark = false;
			if (document.documentElement.classList.contains("dark")) isDark = true;
		}
		catch (e) { }
		return (
			<ThemeProvider theme={isDark ? darkTheme : lightTheme}>
				<div className="adminRoot mainNavGrid">
					<div className="sideBarNav">
						<SideBarNav />
					</div>
					{
						(this.state.showMainNav == true) ?
							<div className="mainNav">
								<MainNav />
							</div>
							: ""
					}
					<div className="mainNavGridContent">
						{this.props.children}
					</div>
				</div>
			</ThemeProvider>
		);
	}
}
