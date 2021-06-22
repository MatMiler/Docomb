import React, { Component } from 'react';
import { EventBus } from '../EventBus';
import { LayoutUtils } from '../LayoutUtils';
export class NotFound extends Component {
    componentDidMount() {
        LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, LayoutUtils.NavBar.ItemKey.Home);
        EventBus.dispatch("navUpdate");
    }
    render() {
        return (React.createElement("div", { className: "errorPage" },
            React.createElement("div", { className: "codeWatermark" }, "404"),
            React.createElement("div", { className: "message" }, "Not found")));
    }
}
//# sourceMappingURL=NotFound.js.map