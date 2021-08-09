import React, { Component } from 'react';
import { EventBus } from '../EventBus';
import { LayoutUtils } from '../LayoutUtils';
import { Layout } from './Layout';
import { LibraryIcon } from '@fluentui/react-icons-mdl2';
export class Home extends Component {
    componentDidMount() {
        LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, LayoutUtils.NavBar.ItemKey.Home);
        EventBus.dispatch("navUpdate");
    }
    render() {
        return (React.createElement(Layout, { mainNavType: null },
            React.createElement("div", { className: "adminHome emptyPage" },
                React.createElement("div", { className: "watermark" },
                    React.createElement(LibraryIcon, null)))));
    }
}
//# sourceMappingURL=Home.js.map