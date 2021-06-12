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
import { Layout } from './Layout';
import { Utils } from '../Data/Utils';
import { Workspaces } from '../Data/Workspaces';
import { LayoutUtils } from '../LayoutUtils';
export class WorkspaceHome extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.populateInfo();
    }
    componentDidUpdate(prevProps, prevState) {
        let prevLocation = Utils.TryGetString(prevProps, ["location", "pathname"]);
        let currentLocation = Utils.TryGetString(this.props, ["location", "pathname"]);
        if (prevLocation != currentLocation)
            this.populateInfo();
    }
    render() {
        var _a, _b, _c;
        return (React.createElement(Layout, { showMainNav: true },
            React.createElement("div", { className: "" },
                "Workspace home page (", (_c = (_b = (_a = this.state) === null || _a === void 0 ? void 0 : _a.pageInfo) === null || _b === void 0 ? void 0 : _b.workspace) === null || _c === void 0 ? void 0 :
                _c.name,
                ")")));
    }
    populateInfo() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield Workspaces.loadPageInfo(Utils.TryGet(this.props, ["match", "params", "itemPath"]));
            LayoutUtils.WindowData.set(LayoutUtils.WindowData.ItemKey.SelectedSideBarItem, (_a = data === null || data === void 0 ? void 0 : data.workspace) === null || _a === void 0 ? void 0 : _a.url);
            this.setState({ pageInfo: data, loading: false });
        });
    }
}
//# sourceMappingURL=WorkspaceHome.js.map