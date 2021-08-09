import React, { Component } from 'react';
import { EventBus } from '../EventBus';
import { LayoutUtils } from '../LayoutUtils';
import { Layout } from './Layout';
import { SettingsIcon } from '@fluentui/react-icons-mdl2';
export class Settings extends Component {
    componentDidMount() {
        LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, LayoutUtils.NavBar.ItemKey.Settings);
        EventBus.dispatch("navUpdate");
    }
    render() {
        return (React.createElement(Layout, { mainNavType: "settings" },
            React.createElement("div", { className: "adminHome emptyPage" },
                React.createElement("div", { className: "watermark" },
                    React.createElement(SettingsIcon, null)))));
    }
}
//# sourceMappingURL=Settings.js.map