import { FontIcon } from '@fluentui/react';
import React, { Component } from 'react';
import { EventBus } from '../EventBus';
import { LayoutUtils } from '../LayoutUtils';
import { Layout } from './Layout';
export class Home extends Component {
    componentDidMount() {
        LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, LayoutUtils.NavBar.ItemKey.Home);
        EventBus.dispatch("navUpdate");
    }
    render() {
        return (React.createElement(Layout, { showMainNav: false },
            React.createElement("div", { className: "adminHome emptyPage" },
                React.createElement("div", { className: "watermark" },
                    React.createElement(FontIcon, { iconName: "Documentation" })))));
    }
}
//# sourceMappingURL=Home.js.map