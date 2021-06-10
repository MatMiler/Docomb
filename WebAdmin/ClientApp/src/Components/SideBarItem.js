import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FontIcon } from '@fluentui/react/lib/Icon';
export class SideBarItem extends Component {
    constructor(props) {
        super(props);
        this.state = { name: props.name, url: props.url, initials: props.initials, icon: props.icon };
    }
    render() {
        let classNames = "sideBarItem";
        let iconContent = React.createElement("span", { className: "icon" }, this.state.initials);
        if (this.state.icon) {
            iconContent = React.createElement("span", { className: "icon" },
                React.createElement(FontIcon, { iconName: this.state.icon }));
        }
        return (React.createElement("div", { className: classNames },
            React.createElement(Link, { to: this.state.url },
                iconContent,
                React.createElement("span", { className: "name" }, this.state.name))));
    }
}
//# sourceMappingURL=SideBarItem.js.map