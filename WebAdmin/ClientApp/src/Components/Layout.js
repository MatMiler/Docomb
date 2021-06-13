import React, { Component } from 'react';
import { ThemeProvider } from '@fluentui/react/lib/Theme';
import { SideBarNav } from './SideBarNav';
import { MainNavWithRouter } from './MainNav';
import { darkTheme, lightTheme } from '../Themes';
export class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = { showMainNav: props.showMainNav };
    }
    render() {
        let isDark = false;
        try {
            isDark = window.matchMedia("(prefers-color-scheme: dark)").matches || isDark;
            if (document.documentElement.classList.contains("light"))
                isDark = false;
            if (document.documentElement.classList.contains("dark"))
                isDark = true;
        }
        catch (e) { }
        let mainNav = null;
        if (this.state.showMainNav == true) {
            mainNav = React.createElement("div", { className: "mainNav" },
                React.createElement(MainNavWithRouter, null));
        }
        return (React.createElement(ThemeProvider, { theme: isDark ? darkTheme : lightTheme },
            React.createElement("div", { className: "adminRoot mainNavGrid" },
                React.createElement("div", { className: "sideBarNav" },
                    React.createElement(SideBarNav, null)),
                mainNav,
                React.createElement("div", { className: "mainNavGridContent" }, this.props.children))));
    }
}
//# sourceMappingURL=Layout.js.map