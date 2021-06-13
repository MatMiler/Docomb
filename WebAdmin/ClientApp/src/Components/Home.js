import React, { Component } from 'react';
import { EventBus } from '../EventBus';
import { LayoutUtils } from '../LayoutUtils';
import { Layout } from './Layout';
export class Home extends Component {
    render() {
        LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, LayoutUtils.NavBar.ItemKey.Home);
        EventBus.dispatch("navUpdate");
        return (React.createElement(Layout, { showMainNav: false },
            React.createElement("div", null, "Docomb administration home page")));
    }
}
//# sourceMappingURL=Home.js.map