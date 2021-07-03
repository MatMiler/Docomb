import React, { Component } from 'react';
import { ThemeProvider } from '@fluentui/react/lib/Theme';
import { SideBarNav } from './SideBarNav';
import { MainNavWithRouter } from './MainNav';
import { darkTheme, lightTheme } from '../Themes';
import SettingsNav from './Settings/SettingsNav';
export class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = { mainNavType: props.mainNavType };
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
        let siteBarNavClassName = "sideBarNav";
        let mainNav = null;
        switch (this.state.mainNavType) {
            case "workspace": {
                mainNav = (React.createElement("div", { className: "mainNav" },
                    React.createElement(MainNavWithRouter, null)));
                siteBarNavClassName += " collapsed";
                break;
            }
            case "settings": {
                mainNav = (React.createElement("div", { className: "mainNav" },
                    React.createElement(SettingsNav, null)));
                siteBarNavClassName += " collapsed";
                break;
            }
            default: {
                siteBarNavClassName += " expanded";
                break;
            }
        }
        return (React.createElement(ThemeProvider, { theme: isDark ? darkTheme : lightTheme },
            React.createElement("div", { className: "adminRoot mainNavGrid" },
                React.createElement("div", { className: siteBarNavClassName },
                    React.createElement(SideBarNav, null)),
                mainNav,
                React.createElement("div", { className: "mainNavGridContent" }, this.props.children))));
    }
}
//# sourceMappingURL=Layout.js.map