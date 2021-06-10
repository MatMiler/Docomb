import React, { Component } from 'react';
import { ThemeProvider } from '@fluentui/react/lib/Theme';
import { SideBarNav } from './SideBarNav';
import { MainNav } from './MainNav';
import { darkTheme, lightTheme } from '../Themes';
export class Layout extends Component {
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
        console.log("Is dark: " + isDark);
        return (React.createElement(ThemeProvider, { theme: isDark ? darkTheme : lightTheme },
            React.createElement("div", { className: "adminRoot mainNavGrid" },
                React.createElement("div", { className: "sideBarNav" },
                    React.createElement(SideBarNav, null)),
                React.createElement("div", { className: "mainNav" },
                    React.createElement(MainNav, null)),
                React.createElement("div", { className: "mainNavGridContent" }, this.props.children))));
    }
}
//# sourceMappingURL=Layout.js.map