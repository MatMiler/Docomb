var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { Component } from 'react';
import { SideBarItem } from './SideBarItem';
import { Workspaces } from "../Data/Workspaces";
import { LayoutUtils } from '../LayoutUtils';
export class SideBarNav extends Component {
    constructor(props) {
        super(props);
        this.state = { workspaces: [], loading: true };
        //LayoutUtils.NavBar.updateNavBar = LayoutUtils.NavBar.updateNavBar.bind(this)
    }
    componentDidMount() {
        this.populateWorkspaces();
    }
    static renderWorkspaces(workspaces) {
        let content = workspaces.map(item => React.createElement(SideBarItem, { key: item.url, name: item.name, url: "/workspace" + item.localUrl, initials: item.initials, exactMatch: false, itemKey: item.url }));
        return (content);
    }
    render() {
        let contents = this.state.loading
            ? React.createElement("div", null)
            : SideBarNav.renderWorkspaces(this.state.workspaces);
        return (React.createElement("div", { className: "sideBar" },
            React.createElement("div", { className: "workspaces" },
                React.createElement(SideBarItem, { name: "Home", url: "/", initials: "H", icon: "Home", itemKey: LayoutUtils.NavBar.ItemKey.Home }),
                contents),
            React.createElement("div", { className: "system" },
                React.createElement(SideBarItem, { name: "Settings", url: "/settings", initials: "S", icon: "Settings", itemKey: LayoutUtils.NavBar.ItemKey.Settings }))));
    }
    populateWorkspaces() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield Workspaces.loadWorkspaceList();
            this.setState({ workspaces: data, loading: false });
        });
    }
}
//# sourceMappingURL=SideBarNav.js.map