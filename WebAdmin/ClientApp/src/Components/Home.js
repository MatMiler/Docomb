import React, { Component } from 'react';
import { LayoutUtils } from '../LayoutUtils';
import { Layout } from './Layout';
export class Home extends Component {
    render() {
        LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, LayoutUtils.NavBar.ItemKey.Home);
        return (React.createElement(Layout, { showMainNav: false },
            React.createElement("div", null, "Docomb administration home page")));
    }
}
//# sourceMappingURL=Home.js.map