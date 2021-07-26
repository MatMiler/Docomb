import { FontIcon } from '@fluentui/react';
import React, { Component } from 'react';
import { EventBus } from '../EventBus';
import { LayoutUtils } from '../LayoutUtils';
import { Layout } from './Layout';
export class Settings extends Component {
    componentDidMount() {
        LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, LayoutUtils.NavBar.ItemKey.Settings);
        EventBus.dispatch("navUpdate");
    }
    render() {
        return (React.createElement(Layout, { mainNavType: "settings" },
            React.createElement("div", { className: "adminHome emptyPage" },
                React.createElement("div", { className: "watermark" },
                    React.createElement(FontIcon, { iconName: "Settings" })))));
    }
}
//# sourceMappingURL=Settings.js.map