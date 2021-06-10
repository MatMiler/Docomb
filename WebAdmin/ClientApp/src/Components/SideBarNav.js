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
export class SideBarNav extends Component {
    constructor(props) {
        super(props);
        this.state = { workspaces: [], loading: true };
    }
    componentDidMount() {
        this.populateWorkspaces();
    }
    static renderWorkspaces(workspaces) {
        let content = workspaces.map(item => React.createElement(SideBarItem, { key: item.url, name: item.name, url: item.url, initials: item.initials }));
        return (content);
    }
    render() {
        let contents = this.state.loading
            ? React.createElement("p", null,
                React.createElement("em", null, "Loading..."))
            : SideBarNav.renderWorkspaces(this.state.workspaces);
        return (React.createElement("div", { className: "sideBar" },
            React.createElement("div", { className: "workspaces" }, contents),
            React.createElement("div", { className: "system" },
                React.createElement(SideBarItem, { name: "Settings", url: "", initials: "S", icon: "Settings" }))));
    }
    populateWorkspaces() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield fetch("api/general/workspaces");
            let data = yield response.json();
            this.setState({ workspaces: data, loading: false });
        });
    }
}
//# sourceMappingURL=SideBarNav.js.map